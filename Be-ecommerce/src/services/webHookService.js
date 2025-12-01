import _ from "lodash";
import db from "../models"
import { Op, where } from "sequelize";

const getPaymentWebHookService = async (webHookData) => {
    try {
        if (!webHookData || !webHookData.gateway || !webHookData.accountNumber || !webHookData.transferAmount) {
            return {
                DT: '',
                EC: -1,
                EM: 'Err from webhook service: missing parameter!'
            }
        }

        await console.log('webhook', webHookData);
        const description = webHookData.description;

        // Try to extract the bill id from description robustly (first sequence of digits)
        const idMatch = description && description.match(/\d+/);
        if (!idMatch) {
            return {
                DT: '',
                EC: -1,
                EM: 'Err from webhook service: cannot parse bill id from description'
            }
        }
        const productCode = idMatch[0];

        // find bill with shopping cart lines
        const bill = await db.Bill.findOne({
            where: { id: productCode },
            attributes: { exclude: ['colorSizeId'] },
            include: [
                {
                    model: db.ShoppingCart,
                    attributes: ['billId', 'colorSizeId', 'total']
                }
            ]
        });

        if (!bill) {
            return {
                DT: '',
                EC: -1,
                EM: 'Err from webhook service: bill not found'
            }
        }

        // If incoming transfer, process using transaction and idempotency
        if (webHookData.transferType === 'in') {
            const result = await db.sequelize.transaction(async (t) => {
                const billInTx = await db.Bill.findOne({
                    where: { id: productCode },
                    include: [
                        {
                            model: db.ShoppingCart,
                            attributes: ['billId', 'colorSizeId', 'total']
                        }
                    ],
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!billInTx) {
                    return { DT: '', EC: -1, EM: 'Err: bill not found' };
                }

                if (billInTx.status === 'Done') {
                    return { DT: '', EC: 0, EM: 'Already processed' };
                }

                billInTx.set({
                    status: 'Done',
                    bankName: webHookData.gateway,
                    accountNumber: webHookData.accountNumber
                });

                for (const item of billInTx.ShoppingCarts) {
                    const product = await db.Color_Size.findOne({
                        where: { id: item.colorSizeId },
                        transaction: t,
                        lock: t.LOCK.UPDATE
                    });

                    if (!product) {
                        return { DT: '', EC: -1, EM: 'Err: product color/size not found' };
                    }

                    const newStock = product.stock - (+item.total);
                    product.set({ stock: newStock < 0 ? 0 : newStock });
                    await product.save({ transaction: t });
                }

                await billInTx.save({ transaction: t });
                return { DT: '', EC: 0, EM: '!' };
            });

            return result;
        }

        // For other transfer types, return default success
        return { DT: '', EC: 0, EM: '!' };
    }
    catch (e) {
        console.log(e);
        return { DT: '', EC: -1, EM: e.message };
    }
}

module.exports = {
    getPaymentWebHookService
}