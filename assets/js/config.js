/* global NexT, boot, CONFIG */
window.NexT = {};
NexT.boot = {};
NexT.comments = {};

NexT.comments.register = function() {
  if (!NexT.CONFIG.page.comments) return;
  for(var c in NexT.comments) { 
    if (c === 'register') continue;
    eval('NexT.comments.'+c)();
  };
};

(function() {
  const className = 'next-config';

  const staticConfig = {};
  let variableConfig = {};

  const parse = text => JSON.parse(text || '{}');

  const update = name => {
    const targetEle = document.querySelector(`.${className}[data-name="${name}"]`);
    if (!targetEle) return;
    const parsedConfig = parse(targetEle.text);
    if (name === 'main') {
      Object.assign(staticConfig, parsedConfig);
    } else {
      variableConfig[name] = parsedConfig;
    }
  };

  update('main');

  window.NexT.CONFIG = new Proxy({}, {
    get(overrideConfig, name) {
      let existing;
      if (name in staticConfig) {
        existing = staticConfig[name];
      } else {
        if (!(name in variableConfig)) update(name);
        existing = variableConfig[name];
      }

      // For unset override and mixable existing
      if (!(name in overrideConfig) && typeof existing === 'object') {
        // Get ready to mix.
        overrideConfig[name] = {};
      }

      if (name in overrideConfig) {
        const override = overrideConfig[name];

        // When mixable
        if (typeof override === 'object' && typeof existing === 'object') {
          // Mix, proxy changes to the override.
          return new Proxy({ ...existing, ...override }, {
            set(target, prop, value) {
              target[prop] = value;
              override[prop] = value;
              return true;
            }
          });
        }

        return override;
      }

      // Only when not mixable and override hasn't been set.
      return existing;
    }
  });

  // TODO
  // document.addEventListener('pjax:success', () => {
  //   variableConfig = {};
  // });
})();