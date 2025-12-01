import express from "express";
import homeController from "../controllers/homeController"
import userController from '../controllers/userController'
import clothesController from "../controllers/clothesController"
import webHookController from '../controllers/webHookController'
import JWTservice from '../middleware/JWTservice'
import billController from '../controllers/billController'
import reviewController from '../controllers/reviewController'
import implementOpenAIService from '../middleware/OpenAI'
import validate from '../middleware/validationMiddleware';
import userValidation from '../validations/userValidation';
import reviewValidation from '../validations/reviewValidation';

const router = express.Router();

/**
 * 
 * @param {*} app :express app
 */



const initApiRoutes = (app) => {

    // ==========================================
    // PUBLIC ROUTES (No Auth Required)
    // ==========================================

    // User Auth
    router.post("/user/login", validate(userValidation.loginSchema), userController.handleLogin)
    router.post("/user/register", validate(userValidation.registerSchema), userController.handleRegister)
    router.get("/account", userController.handleAccount) // Often public to check status, or handles its own null check
    
    // Public Data Access
    router.get('/clothes/get', clothesController.handleGetClothes);
    router.get('/review/get', reviewController.handleGetReview);
    
    // Webhooks & Third Party
    router.post('/hooks/payment', webHookController.handleGetPayment);
    router.get('/socket.io', userController.handleGetRoomId)
    router.get('/openAI/get', implementOpenAIService)


    // ==========================================
    // PROTECTED ROUTES (Auth Required)
    // ==========================================
    
    // Apply Auth Middleware to all routes defined below this point
    router.use(JWTservice.checkCookieService);
    router.use(JWTservice.authenticateCookieService);

    // User Management
    router.get("/user/get", userController.handleGetUser)
    router.put('/user/update', validate(userValidation.updateUserSchema), userController.handleUpdateUser)

    // Clothes Management
    router.post('/clothes/create', clothesController.handleCreateClothes);
    router.put('/clothes/update', clothesController.handleUpdateClothes);
    router.delete('/clothes/delete', clothesController.handleDeleteClothes);

    // Checkout & Bill
    router.post('/bill/create', billController.handleCreateBill);
    router.put('/bill/update', billController.handleUpdateBill);
    router.get('/bill/get', billController.handleGetBill);
    router.delete('/bill/delete', billController.handleDeleteBill);

    // Reviews Management
    router.post('/review/create', validate(reviewValidation.createReviewSchema), reviewController.handleCreateReview);
    router.put('/review/update', validate(reviewValidation.updateReviewSchema), reviewController.handleUpdateReview);
    router.delete('/review/delete', reviewController.handleDeleteReview);

    return app.use("/api", router)

}

export default initApiRoutes;