// src/pages/Terms.js
import React from 'react';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">
      <div className="container">
        <h1>Terms and Conditions</h1>
        
        <div className="terms-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to School Uniforms. These terms and conditions outline the rules and regulations 
              for the use of our website and services.
            </p>
            <p>
              By accessing this website, we assume you accept these terms and conditions in full. 
              Do not continue to use School Uniforms if you do not accept all of the terms and 
              conditions stated on this page.
            </p>
          </section>
          
          <section>
            <h2>2. License</h2>
            <p>
              Unless otherwise stated, School Uniforms and/or its licensors own the intellectual 
              property rights for all material on this website. All intellectual property rights 
              are reserved.
            </p>
            <p>
              You may view and/or print pages from this website for your own personal use subject 
              to restrictions set in these terms and conditions.
            </p>
          </section>
          
          <section>
            <h2>3. User Account</h2>
            <p>
              If you create an account on our website, you are responsible for maintaining the 
              security of your account and you are fully responsible for all activities that 
              occur under the account.
            </p>
            <p>
              You must immediately notify us of any unauthorized uses of your account or any 
              other breaches of security.
            </p>
          </section>
          
          <section>
            <h2>4. Orders and Payments</h2>
            <p>
              All orders are subject to availability and confirmation of the order price. 
              We reserve the right to refuse any order you place with us.
            </p>
            <p>
              Payments are processed through secure payment gateways. By providing your payment 
              information, you represent that you have the legal right to use the payment method.
            </p>
          </section>
          
          <section>
            <h2>5. Returns and Refunds</h2>
            <p>
              Due to the custom nature of our products, returns are only accepted in cases of 
              manufacturing defects. Please contact us within 7 days of delivery to initiate 
              a return request.
            </p>
            <p>
              Refunds will be processed within 14 business days after inspection and approval 
              of the returned item.
            </p>
          </section>
          
          <section>
            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall School Uniforms, nor any of its officers, directors, and employees, 
              be liable to you for anything arising out of or in any way connected with your use 
              of this website.
            </p>
          </section>
          
          <section>
            <h2>7. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws 
              of South Africa, and you irrevocably submit to the exclusive jurisdiction of the 
              courts in that location.
            </p>
          </section>
          
          <section>
            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to revise these terms and conditions at any time as we see fit. 
              By using this website you are expected to review these terms regularly.
            </p>
          </section>
          
          <section>
            <h2>9. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p>
              Email: legal@schooluniforms.com<br />
              Phone: +1 (555) 123-4567<br />
              Address: 123 Education Street, Knowledge City, 12345
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;