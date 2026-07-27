/* ==========================================================================
   King of Kings Christian Assembly (KKCA Ministries)
   Interactive Features & Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCountdownTimer();
  initScrollEffects();
  setCopyrightYear();
});

/* 1. Mobile Navigation Toggle */
function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }
}

/* 2. Scroll Spy & Active Nav Link Update */
function initScrollEffects() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* 3. Live Countdown to Next Sunday Worship Service */
function initCountdownTimer() {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const nextServiceEl = document.getElementById('nextServiceName');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateCountdown() {
    const now = new Date();
    const nextSunday = new Date();
    
    // Calculate days until next Sunday (0 is Sunday)
    const dayOfWeek = now.getDay();
    let daysUntilSunday = (7 - dayOfWeek) % 7;
    
    // If today is Sunday and past 11:00 AM, set to next week's Sunday
    if (dayOfWeek === 0 && (now.getHours() > 11 || (now.getHours() === 11 && now.getMinutes() > 0))) {
      daysUntilSunday = 7;
    }

    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(9, 0, 0, 0); // Sunday 9:00 AM

    const diff = nextSunday - now;

    if (diff <= 0) {
      if (nextServiceEl) nextServiceEl.textContent = 'Sunday Worship Service in Progress!';
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = days < 10 ? '0' + days : days;
    hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* 4. One-Click Copy Helper with Toast */
function copyText(inputId) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;

  inputEl.select();
  inputEl.setSelectionRange(0, 99999); // Mobile compatibility

  navigator.clipboard.writeText(inputEl.value).then(() => {
    showToast(`Copied to clipboard: ${inputEl.value}`);
  }).catch(() => {
    // Fallback for older browsers
    document.execCommand('copy');
    showToast(`Copied: ${inputEl.value}`);
  });
}

/* 5. Toast Notification System */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (message.startsWith('✅') || message.startsWith('❌')) {
    toast.innerHTML = message;
  } else {
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#D4AF37; margin-right: 0.5rem;"></i> ${message}`;
  }
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 4500); // 4.5 seconds to read multiline messages
}

/* 6. Lightbox Modal for Gallery & QR Code */
function openLightbox(imgSrc, captionText) {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');

  if (modal && modalImg) {
    modalImg.src = imgSrc;
    if (modalCaption) modalCaption.textContent = captionText || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Close Lightbox on Outside Click or Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
document.getElementById('lightboxModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'lightboxModal') closeLightbox();
});

/* 7. Interactive Prayer Request Submission */
async function submitPrayerRequest(event) {
  event.preventDefault();
  
  const form = document.getElementById('prayerForm');
  if (!form) return;

  const name = document.getElementById('pName')?.value?.trim();
  const phone = document.getElementById('pPhone')?.value?.trim();
  const city = document.getElementById('pCity')?.value?.trim() || '';
  const message = document.getElementById('pMessage')?.value?.trim();
  const submitBtn = form.querySelector('button[type="submit"]');

  // Client-side verification
  if (!name || !phone || !message) {
    showToast('❌ Please fill in all required fields.');
    return;
  }

  // Prevent duplicate submissions: disable button and show loading spinner with text
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending Prayer Request...';
  }

  try {
    const response = await fetch('https://kkca.onrender.com/api/prayer-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: name,
        mobile: phone,
        city: city,
        prayer_request: message
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showToast('✅ Prayer request sent successfully.<br>Thank you. We will pray for you.');
      form.reset();
    } else {
      throw new Error(data.message || 'Submission failed');
    }
  } catch (error) {
    console.error('Error submitting prayer request:', error);
    showToast('❌ Unable to send your prayer request.<br>Please try again later.');
  } finally {
    // Enable the button and restore original state
    if (submitBtn) {
      submitBtn.disabled = false;
      if (submitBtn.dataset.originalContent) {
        submitBtn.innerHTML = submitBtn.dataset.originalContent;
      }
    }
  }
}

/* 8. Add to Calendar Placeholder Notification */
function addToCal(serviceName, time) {
  showToast(`Reminder for "${serviceName}" set! We look forward to gathering with you.`);
}

/* 9. Dynamic Copyright Year */
function setCopyrightYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
