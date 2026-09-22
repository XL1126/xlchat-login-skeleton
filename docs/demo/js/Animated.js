/* Animated.jsx — 1:1
 * mount: useState 随机动画 + isVisible=false → style opacity:0
 * useEffect: 注入 @keyframes 到 <style>
 * delay ms 后 isVisible=true → style: opacity:0; animation:'name 270ms ease-out forwards'; animation-delay:delay
 */
(function (global) {
  'use strict';

  var ANIMATIONS = [
    {
      name: 'fadeInUp',
      keyframes: '\n      @keyframes fadeInUp {\n        from {\n          opacity: 0;\n          transform: translateY(30px);\n        }\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n    ',
      animation: 'fadeInUp 270ms ease-out forwards'
    },
    {
      name: 'fadeInDown',
      keyframes: '\n      @keyframes fadeInDown {\n        from {\n          opacity: 0;\n          transform: translateY(-30px);\n        }\n        to {\n          opacity: 1;\n          transform: translateY(0);\n        }\n      }\n    ',
      animation: 'fadeInDown 270ms ease-out forwards'
    },
    {
      name: 'fadeInLeft',
      keyframes: '\n      @keyframes fadeInLeft {\n        from {\n          opacity: 0;\n          transform: translateX(-30px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n    ',
      animation: 'fadeInLeft 270ms ease-out forwards'
    },
    {
      name: 'fadeInRight',
      keyframes: '\n      @keyframes fadeInRight {\n        from {\n          opacity: 0;\n          transform: translateX(30px);\n        }\n        to {\n          opacity: 1;\n          transform: translateX(0);\n        }\n      }\n    ',
      animation: 'fadeInRight 270ms ease-out forwards'
    },
    {
      name: 'fadeInScale',
      keyframes: '\n      @keyframes fadeInScale {\n        from {\n          opacity: 0;\n          transform: scale(0.9);\n        }\n        to {\n          opacity: 1;\n          transform: scale(1);\n        }\n      }\n    ',
      animation: 'fadeInScale 270ms ease-out forwards'
    },
    {
      name: 'fadeInRotate',
      keyframes: '\n      @keyframes fadeInRotate {\n        from {\n          opacity: 0;\n          transform: rotate(-5deg) scale(0.95);\n        }\n        to {\n          opacity: 1;\n          transform: rotate(0deg) scale(1);\n        }\n      }\n    ',
      animation: 'fadeInRotate 270ms ease-out forwards'
    }
  ];

  function find(name) {
    for (var i = 0; i < ANIMATIONS.length; i++) {
      if (ANIMATIONS[i].name === name) return ANIMATIONS[i];
    }
    return ANIMATIONS[0];
  }

  function pickRandom() {
    return ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)];
  }

  /** 生成 Animated 包装节点（对应 JSX 外层 div） */
  function Animated(delay, html, seedKey) {
    var anim = pickRandom();
    if (seedKey) {
      Animated._seeds = Animated._seeds || {};
      if (!Animated._seeds[seedKey]) {
        Animated._seeds[seedKey] = anim;
      }
      anim = Animated._seeds[seedKey];
    }
    return (
      '<div class="animated-host" data-delay="' + delay + '" data-anim="' + anim.name + '">' +
      html +
      '</div>'
    );
  }

  Animated.resetSeeds = function () {
    Animated._seeds = {};
  };

  Animated.removeInjectedKeyframes = function () {
    var nodes = document.querySelectorAll('style[data-animated-injected]');
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  };

  Animated.injectKeyframes = function (animation) {
    if (!animation || !animation.keyframes) return;
    var styleElement = document.createElement('style');
    styleElement.setAttribute('data-animated-injected', animation.name);
    styleElement.innerHTML = animation.keyframes;
    document.head.appendChild(styleElement);
  };

  /**
   * playEntrance=true  — 组件 mount（路由切换）：双延迟入场
   * playEntrance=false — 同路由 re-render：isVisible 已 true，动画 forwards 结束态
   */
  Animated.mount = function (root, playEntrance) {
    var timers = [];
    Animated.removeInjectedKeyframes();
    var nodes = root.querySelectorAll('.animated-host');

    Array.prototype.forEach.call(nodes, function (node) {
      var delay = parseInt(node.getAttribute('data-delay') || '0', 10);
      var anim = find(node.getAttribute('data-anim') || 'fadeInUp');

      if (!playEntrance) {
        node.style.cssText = 'opacity:1;transform:none;';
        return;
      }

      /* !isVisible */
      node.style.cssText = 'opacity:0;';
      Animated.injectKeyframes(anim);

      /* setTimeout(delay) → setIsVisible(true) */
      timers.push(
        window.setTimeout(function () {
          if (!node.isConnected) return;
          node.style.opacity = '0';
          node.style.animation = anim.animation;
          node.style.animationDelay = delay + 'ms';
        }, delay)
      );
    });

    return function unmount() {
      timers.forEach(clearTimeout);
      Animated.removeInjectedKeyframes();
    };
  };

  global.XL = global.XL || {};
  global.XL.Animated = Animated;
  global.XL.ANIMATIONS = ANIMATIONS;
})(window);
