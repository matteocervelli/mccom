---
title: "Thanks for Subscribing!"
date: 2025-04-12
draft: false
layout: "minimal"
description: "Your newsletter subscription request has been received."
robots: "noindex, nofollow"
---

## Thanks for Subscribing!

Your subscription request to *The Scalability Compass* has been received.

**To complete your subscription, please confirm your email address by clicking the link in the email we just sent you.**

If you don't see the email in your inbox, please check your spam or promotions folder.

<div class="resend-section">
  <p>
    <a href="javascript:void(0);" id="resend-link" class="resend-link">Didn't receive the confirmation email? Click here to request a new one</a>
  </p>
  <p id="resend-message" class="resend-message"></p>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const resendLink = document.getElementById('resend-link');
  const messageEl = document.getElementById('resend-message');
  let isSending = false; // Flag to prevent multiple clicks
  
  // Get email from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  let email = urlParams.get('email') || '';
  
  // Handle link click
  resendLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (isSending) return; // Prevent multiple submissions
    
    let emailToUse = email;
    
    // If we don't have an email in URL, show a prompt
    if (!emailToUse) {
      const userEmail = prompt('Enter your email address to request a new confirmation:');
      if (!userEmail || !isValidEmail(userEmail)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }
      emailToUse = userEmail;
    }
    
    sendConfirmationRequest(emailToUse);
  });
  
  function sendConfirmationRequest(emailAddress) {
    isSending = true;
    // Update UI
    resendLink.classList.add('sending');
    resendLink.textContent = 'Sending...';
    showMessage('', ''); // Clear previous message
    
    // Send request
    fetch('/api/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAddress, language: 'en' })
    })
    .then(response => response.json())
    .then(data => {
      showMessage('Request sent! Please check your inbox (and spam folder) for the confirmation email.', 'success');
    })
    .catch(error => {
      console.error('Error:', error);
      showMessage('An error occurred. Please try again later or contact support.', 'error');
    })
    .finally(() => {
      isSending = false;
      resendLink.classList.remove('sending');
      resendLink.textContent = 'Didn\'t receive the confirmation email? Click here to request a new one';
    });
  }
  
  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'resend-message ' + type;
    // Make message visible if there is text
    messageEl.style.display = text ? 'block' : 'none';
  }
  
  function isValidEmail(emailToCheck) {
    // Simple regex for email validation
    return /\S+@\S+\.\S+/.test(emailToCheck);
  }
});
</script>

You can return to the [Homepage](/en/) or explore the [Newsletter Archive](/en/newsletter/).
