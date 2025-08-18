import { useState, useEffect } from 'react';
import './ContactWidget.css';

function ContactWidgetLarge() {
        const [formName, setFormName] = useState("");
        const [formEmail, setFormEmail] = useState("");
        const [formBody, setFormBody] = useState("");

        //contact info
        //contact form




        const sendContactForm = () => {
                // 1. Check for empty fields
                if (formName === "" || formEmail === "" || formBody === "") {
                  alert("Please fill out all fields.");
                  return;
                }
              
                // 2. Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formEmail)) {
                  alert("Please enter a valid email address.");
                  return;
                }
              
                // 3. Compose subject and body, and encode them for URL
                const subject = `Contact Form Submission from ${formName}`;
                const bodyStr = `${formName} (${formEmail}) says:\n\n${formBody}`;
              
                const mailRef = `mailto:simonek@andrew.cmu.edu` +
                  `?subject=${encodeURIComponent(subject)}` +
                  `&body=${encodeURIComponent(bodyStr)}`;
              
                // 4. Open the mail client
                window.open(mailRef, "_blank");
              };
              
    return (
        <div className='outerContactWidgetLarge'>
                <p className='contactTitleLarge'>Contact Information:</p>
                <div className='contactRowLarge'>
                        <p>Phone: </p>
                        <p>(818)-294-5480</p>
                </div>
                <div className='contactRowLarge'>
                        <p>Email: </p>
                        <p>Simonek@andrew.cmu.edu</p>
                </div>
                <div className='contactFormDiv'>
                        <p className="contactFormTitle">Quick Contact Form: </p>
                        <div className='contactFormBorder'>
                                <div className='contactFormRow'>
                                        <p>Name: </p>
                                        <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}></input>
                                </div>
                                <div className='contactFormRow'>
                                        <p>Email: </p>
                                        <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)}></input>
                                </div>
                                <div className='contactFormMessage'>
                                        <p>Message: </p>
                                        <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)}></textarea>
                                </div>
                                <button className='contactSendBtn' onClick={() => sendContactForm()}>Send</button>
                        </div>
                </div>
        </div>
    );
}

export default ContactWidgetLarge;
