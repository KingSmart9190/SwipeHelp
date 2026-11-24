/* =====================================================
   SwipeHelp – Swipe Gesture Engine
   Touch + Mouse drag for card swiping
   ===================================================== */

class SwipeEngine {
  constructor({ cardSelector, onSwipeRight, onSwipeLeft, threshold = 80 }) {
    this.cardSelector = cardSelector;
    this.onSwipeRight = onSwipeRight;
    this.onSwipeLeft  = onSwipeLeft;
    this.threshold    = threshold;
    this.card         = null;
    this.startX = 0; this.startY = 0;
    this.currentX = 0;
    this.isDragging = false;
    this._bind();
  }

  _bind() {
    document.addEventListener('mousedown',  e => this._start(e.clientX, e.clientY, e.target));
    document.addEventListener('mousemove',  e => this._move(e.clientX, e.clientY));
    document.addEventListener('mouseup',    e => this._end());
    document.addEventListener('touchstart', e => { const t = e.touches[0]; this._start(t.clientX, t.clientY, e.target); }, { passive: true });
    document.addEventListener('touchmove',  e => { const t = e.touches[0]; this._move(t.clientX, t.clientY); },  { passive: true });
    document.addEventListener('touchend',   e => this._end());
  }

  _getCard(el) {
    return el.closest(this.cardSelector);
  }

  _start(x, y, target) {
    const card = this._getCard(target);
    if (!card) return;
    this.card = card;
    this.startX = x;
    this.startY = y;
    this.currentX = 0;
    this.isDragging = true;
    this.card.style.transition = 'none';
  }

  _move(x, y) {
    if (!this.isDragging || !this.card) return;
    this.currentX = x - this.startX;
    const rotate = this.currentX * 0.07;
    this.card.style.transform = `translateX(${this.currentX}px) rotate(${rotate}deg)`;

    const stampYes = this.card.querySelector('.stamp-yes');
    const stampNo  = this.card.querySelector('.stamp-no');

    if (this.currentX > 20 && stampYes) {
      stampYes.style.opacity = Math.min((this.currentX - 20) / 60, 1);
      if (stampNo) stampNo.style.opacity = 0;
      this.card.classList.add('swiping-right');
      this.card.classList.remove('swiping-left');
    } else if (this.currentX < -20 && stampNo) {
      stampNo.style.opacity = Math.min((-this.currentX - 20) / 60, 1);
      if (stampYes) stampYes.style.opacity = 0;
      this.card.classList.add('swiping-left');
      this.card.classList.remove('swiping-right');
    } else {
      if (stampYes) stampYes.style.opacity = 0;
      if (stampNo)  stampNo.style.opacity  = 0;
      this.card.classList.remove('swiping-right', 'swiping-left');
    }
  }

  _end() {
    if (!this.isDragging || !this.card) return;
    this.isDragging = false;
    this.card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    if (this.currentX > this.threshold) {
      this._flyOut('right');
    } else if (this.currentX < -this.threshold) {
      this._flyOut('left');
    } else {
      this._snapBack();
    }
  }

  _flyOut(direction) {
    const card = this.card;
    const vw   = window.innerWidth;
    const tx   = direction === 'right' ? vw * 1.5 : -vw * 1.5;
    const rot  = direction === 'right' ? 30 : -30;
    card.style.transform = `translateX(${tx}px) rotate(${rot}deg)`;
    setTimeout(() => {
      card.style.display = 'none';
      if (direction === 'right' && this.onSwipeRight) this.onSwipeRight(card);
      if (direction === 'left'  && this.onSwipeLeft)  this.onSwipeLeft(card);
    }, 380);
    this.card = null;
  }

  _snapBack() {
    const stampYes = this.card.querySelector('.stamp-yes');
    const stampNo  = this.card.querySelector('.stamp-no');
    if (stampYes) stampYes.style.opacity = 0;
    if (stampNo)  stampNo.style.opacity  = 0;
    this.card.classList.remove('swiping-right', 'swiping-left');
    this.card.style.transform = 'translateX(0) rotate(0deg)';
    this.card = null;
  }

  /* Allow external trigger (button click) */
  triggerSwipe(direction) {
    const card = document.querySelector(this.cardSelector + ':not([style*="display: none"])');
    if (!card) return;
    this.card = card;
    this.currentX = direction === 'right' ? this.threshold + 10 : -(this.threshold + 10);
    this.card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    this._flyOut(direction);
  }
}

