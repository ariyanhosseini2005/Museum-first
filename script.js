// متغیر ثابت برای عنوان پیش‌فرض (برای حالت اولیه)
const DEFAULT_TITLE = "Choose Your Preferred Language";

// تابع کمکی برای تشخیص اینکه آیا متن شامل حروف RTL (عربی، عبری و ...) است یا خیر.
function isTextRTL(text) {
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
}

Vue.config.devtools = true;

Vue.component("panel", {
  template: `
    <div class="panel"
      :style="panelTransform"
      @mousemove="handleMouseMove"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      ref="panel">
      <div class="panel-bg" :style="panelBgStyle"></div>
      <div class="panel-overlay"></div>
      <div class="panel-content">
        <img :src="$parent.panels[index].flag" alt="Flag" class="flag">
        <h1 :style="{ fontFamily: fontForLang }" :dir="isRTL ? 'rtl' : 'ltr'">
          {{$parent.panels[index].lang}}
        </h1>
        <svg class="cultural-icon" viewBox="0 0 100 100">
          <path :d="$attrs['data-icon']" fill="none" :stroke="$parent.panels[index].iconColor" stroke-width="3"/>
        </svg>
        <p>{{$parent.panels[index].desc}}</p>
      </div>
    </div>
  `,
  props: ['index'],
  data: () => ({
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    mouseLeaveDelay: null,
  }),
  mounted() {
    // دریافت ابعاد پنل برای محاسبه دقیق افکت‌های حرکتی
    this.width = this.$refs.panel.offsetWidth;
    this.height = this.$refs.panel.offsetHeight;
  },
  computed: {
    mousePX() {
      return this.mouseX / this.width;
    },
    mousePY() {
      return this.mouseY / this.height;
    },
    panelBgStyle() {
      // افکت پارالاکس برای پس‌زمینه: حرکت نسبی تصویر
      const tX = this.mousePX * -40;
      const tY = this.mousePY * -40;
      return {
        backgroundImage: `url(${this.$attrs['data-image']})`,
        transform: `translate(${tX}px, ${tY}px)`
      };
    },
    panelTransform() {
      // افکت چرخش 3 بعدی برای کل پنل
      const factor = 10; // حداکثر درجه چرخش
      const rotateY = (this.mouseX / (this.width / 2)) * factor; 
      const rotateX = - (this.mouseY / (this.height / 2)) * factor;
      return {
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      };
    },
    fontForLang() {
      // انتخاب فونت اختصاصی بر اساس زبان پنل
      const lang = this.$parent.panels[this.index].lang;
      if (lang === "فارسی") return "'Vazirmatn', sans-serif";
      if (lang === "العربية") return "'Cairo', sans-serif";
      if (lang === "Français") return "'EB Garamond', serif";
      return "'Montserrat', sans-serif";
    },
    isRTL() {
      // بررسی جهت زبان: برای فارسی و عربی باید RTL باشد.
      const lang = this.$parent.panels[this.index].lang;
      return (lang === "فارسی" || lang === "العربية");
    },
  },
  methods: {
    handleMouseMove(e) {
      // محاسبه موقعیت نسبی موس در داخل پنل
      const rect = this.$refs.panel.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left - this.width / 2;
      this.mouseY = e.clientY - rect.top - this.height / 2;
    },
    handleMouseEnter() {
      clearTimeout(this.mouseLeaveDelay);
      const titleEl = document.getElementById("dynamic-title");
      const newTitle = this.$parent.panels[this.index].title;
      // اگر عنوان جدید همان عنوان فعلی باشد، تغییر ایجاد نمی‌شود
      if (titleEl.dataset.currentTitle === newTitle) return;
      titleEl.dataset.currentTitle = newTitle;
      const dirAttr = isTextRTL(newTitle) ? 'rtl' : 'ltr';
      titleEl.classList.add("glitch");
      setTimeout(() => {
        // اگر متن شامل حروف RTL باشد، از تقسیم کاراکتر استفاده نمی‌کنیم
        if (isTextRTL(newTitle)) {
          titleEl.innerHTML = `<span dir="${dirAttr}">${newTitle}</span>`;
        } else {
          titleEl.innerHTML = `<span dir="${dirAttr}">${newTitle.split("").map(char => `<span>${char}</span>`).join("")}</span>`;
        }
        titleEl.classList.remove("glitch");
      }, 100);
    },
    handleMouseLeave() {
      this.mouseLeaveDelay = setTimeout(() => {
        const titleEl = document.getElementById("dynamic-title");
        // به جای استفاده از متن فارسی به عنوان مقدار پیش‌فرض از DEFAULT_TITLE استفاده می‌کنیم.
        if (titleEl.dataset.currentTitle === DEFAULT_TITLE) return;
        titleEl.dataset.currentTitle = DEFAULT_TITLE;
        titleEl.classList.add("glitch");
        setTimeout(() => {
          // برای پیش‌فرض، از متن انگلیسی به عنوان default استفاده می‌کنیم.
          titleEl.innerHTML = `<span dir="ltr">${DEFAULT_TITLE}</span>`;
          titleEl.classList.remove("glitch");
        }, 100);
      }, 400);
    },
  },
});

new Vue({
  el: "#app",
  data: {
    panels: [
      {
        lang: "فارسی",
        flag: "https://flagcdn.com/w80/ir.png",
        iconColor: "#d4af37",
        desc: "دروازه‌ای به شکوه پارسی",
        image: "images/perspolis.jpg",
        title: "زبان مورد نظر خود را انتخاب کنید",
        icon: "M50,5 L95,50 L50,95 L5,50 Z"
      },
      {
        lang: "العربية",
        flag: "https://flagcdn.com/w80/ae.png",
        iconColor: "#7209b7",
        desc: "نافذة على التراث العربي",
        image: "images/louvre-abudhabi.jpg",
        title: "اختر لغتك المفضلة",
        icon: "M20,20 L80,20 L80,80 L20,80 Z M30,30 L70,30 L70,70 L30,70 Z"
      },
      {
        lang: "English",
        flag: "https://flagcdn.com/w80/gb.png",
        iconColor: "#00b4d8",
        desc: "Bridge to global heritage",
        image: "images/british-museum.jpg",
        title: "Choose Your Preferred Language",
        icon: "M30,80 L70,80 L70,20 L50,40 L30,20 Z"
      },
      {
        lang: "Français",
        flag: "https://flagcdn.com/w80/fr.png",
        iconColor: "#d4af37",
        desc: "La voix de l'élégance",
        image: "images/louvre-paris.jpg",
        title: "Choisissez votre langue préférée",
        icon: "M50,20 L80,80 L20,80 Z"
      },
    ],
  },
});
