import React, { useState } from 'react';
import './Contact.scss';
import { useCreateContactMutation } from '../../../store/slice/API/otherAPI';

function Contact() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [createContact, { isLoading }] = useCreateContactMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createContact({ email, message });
      if (res && res.data && res.data.EC === 0) {
        alert('Gửi thành công');
        setMessage('');
        setEmail('');
      } else {
        alert(res?.data?.EM || 'Gửi thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi gửi');
    }
  };

  return (
    <div className="contact-container container">
      <h2>Contact Us</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default Contact;
