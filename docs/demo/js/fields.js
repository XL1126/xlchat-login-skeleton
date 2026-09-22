* UI 片段：对照各页 JSX 中的 ds-input 结构 */
(function (global) {
  'use strict';

  var esc = global.XL.esc;

  function textField(opts) {
    return (
      '<div class="form-group"><div class="ds-form-item__content">' +
      '<div class="ds-input ds-input--none ds-input--bordered ds-input--l"' +
      (opts.inputStyle ? ' style="' + opts.inputStyle + '"' : '') +
      '>' +
      '<input type="' + (opts.type || 'text') + '" class="ds-input__input" data-field="' + opts.field +
      '" placeholder="' + esc(opts.placeholder) + '" value="' + esc(opts.value) + '"' +
      (opts.maxlength ? ' maxlength="' + opts.maxlength + '"' : '') +
      (opts.size ? ' size="' + opts.size + '"' : '') +
      (opts.required ? ' required' : '') +
      ' autocomplete="off" autocapitalize="off" spellcheck="false" />' +
      (opts.suffix || '') +
      '</div></div></div>'
    );
  }

  function codeField(state) {
    var btnText =
      state.countdown > 0 ? state.countdown + '秒' : state.codeLoading ? '发送中...' : '发送验证码';
    var suffix =
      '<div class="ds-input__suffix">' +
      '<div class="ds-verify-code-input-divider"></div>' +
      '<button class="ds-link-button ds-verify-code-input-countdown" type="button" data-action="send-code"' +
      (state.countdown > 0 || state.codeLoading ? ' disabled' : '') +
      '>' +
      '<span class="ds-link-button__text">' + esc(btnText) + '</span>' +
      '<div class="ds-focus-ring"></div></button></div>';
    return textField({
      field: 'verificationCode',
      type: 'tel',
      placeholder: '请输入验证码',
      value: state.verificationCode,
      maxlength: '6',
      size: '1',
      required: true,
      inputStyle: '--ds-input-padding:0 20px 0 16px',
      suffix: suffix
    });
  }

  function submitBtn(loading, loadingText, text) {
    return (
      '<button type="submit" class="submit-btn"' + (loading ? ' disabled' : '') + '>' +
      (loading ? loadingText : text) +
      '</button>'
    );
  }

  global.XL = global.XL || {};
  global.XL.fields = { textField: textField, codeField: codeField, submitBtn: submitBtn };
})(window);
