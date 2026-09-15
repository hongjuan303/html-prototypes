const LOGIN_SCOPE = 'data-v-ba31ec3f';
const BUSINESS_SCOPE = 'data-v-af111376';
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

const closeIcon = (scope) => `<svg ${scope} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path ${scope} d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const downIcon = () => `<svg ${BUSINESS_SCOPE} class="select-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path ${BUSINESS_SCOPE} d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const checkIcon = () => `<svg ${BUSINESS_SCOPE} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path ${BUSINESS_SCOPE} d="m2 5 2 2 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const roles = ['企业负责人', '内容负责人', '制片人', '导演', '编剧', '投资机构', '政府或事业单位', '其他'];
const directions = ['IP版权合作', '漫剧制作', 'AI工具/平台合作', '内容发行与投流', '海外发行', '政企项目', '其他'];

/** QA login markup only. Input state, validation and submission are owned by app.js. */
export function loginMarkup(phone = '', preset = false) {
  const scope = LOGIN_SCOPE;
  const safePhone = escapeHtml(phone);
  const validPhone = /^1[3-9]\d{9}$/.test(String(phone));
  return `<section ${scope} class="login-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div ${scope} class="login-modal__border" aria-hidden="true"></div>
    <button ${scope} class="login-close" type="button" data-close aria-label="关闭弹窗">${closeIcon(scope)}</button>
    <div ${scope} class="login-modal__left"><img ${scope} class="login-modal__left-img" src="assets/login-art.png" alt=""/><div ${scope} class="login-modal__left-overlay" aria-hidden="true"></div></div>
    <div ${scope} class="login-modal__right">
      <div ${scope} class="login-logo"><img ${scope} class="login-logo__text" src="assets/logo.png" alt="容量万相"/></div>
      <h2 ${scope} class="login-title prd-anchor" id="modalTitle">欢迎登录容量万相<span class="prd-pin" data-prd-number="3" title="PRD 3 · 审核制登录" aria-hidden="true">3</span></h2>
      <form ${scope} class="login-form" id="loginForm" novalidate>
        <div ${scope} class="login-form-group">
          <label ${scope} class="login-form-label" for="phone">手机号</label>
          <div ${scope} class="login-input-wrap login-mobile-wrap"><span ${scope} class="login-country-code">+86</span><input ${scope} class="login-input" id="phone" name="phone" type="tel" inputmode="numeric" maxlength="11" autocomplete="tel-national" placeholder="请输入手机号" value="${safePhone}" aria-required="true"/></div>
        </div>
        <div ${scope} class="login-form-group">
          <label ${scope} class="login-form-label" for="code">验证码</label>
          <div ${scope} class="login-code-row"><input ${scope} class="login-input" id="code" name="code" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="请输入验证码" value="${preset ? '123456' : ''}" aria-required="true" aria-describedby="loginError"/><button ${scope} class="login-code-btn" id="sendCode" type="button"${validPhone ? '' : ' disabled'}>获取验证码</button></div>
          <div ${scope} class="login-field-error" id="loginError" role="alert" aria-live="polite"></div>
        </div>
        <label ${scope} class="login-agreement"><input ${scope} id="agreement" name="agreement" type="checkbox" aria-required="true"/><span ${scope}>我已阅读并同意</span><a ${scope} href="https://aiqa.weiduanju.com/user-agreement" target="_blank" rel="noopener">《用户协议》</a><span ${scope}>和</span><a ${scope} href="https://aiqa.weiduanju.com/privacy-policy" target="_blank" rel="noopener">《隐私政策》</a></label>
        <button ${scope} class="login-submit-btn${preset && validPhone ? '' : ' is-disabled'}" id="submitLogin" type="submit">登录/注册</button>
      </form>
      <p ${scope} class="login-help">无法登录？<button ${scope} type="button" id="loginHelpBusiness">联系商务</button></p>
    </div>
  </section>`;
}

/** QA business form markup only. Dropdown actions and data persistence are external. */
export function businessMarkup(phone = '') {
  const scope = BUSINESS_SCOPE;
  return `<div ${scope} class="bussiness-wrap">
    <button ${scope} class="bussiness-close" type="button" data-close aria-label="关闭弹窗">${closeIcon(scope)}</button>
    <section ${scope} class="bussiness-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="businessSubtitle">
      <div ${scope} class="bussiness-modal__border" aria-hidden="true"></div>
      <h2 ${scope} class="bussiness-title prd-anchor" id="modalTitle">商务合作<span class="prd-pin" data-prd-number="3" title="PRD 3 · 联系商务表单" aria-hidden="true">3</span></h2>
      <p ${scope} class="bussiness-subtitle" id="businessSubtitle">请留下合作需求，我们将在 1 个工作日内与您联系</p>
      <div ${scope} class="bussiness-divider" aria-hidden="true"></div>
      <form ${scope} class="bussiness-form" id="businessForm" novalidate>
        <div ${scope} class="form-row">
          <div ${scope} class="form-group"><label ${scope} class="form-label" for="business-name"><span ${scope} class="required" aria-hidden="true">*</span>姓名</label><input ${scope} class="form-input" id="business-name" name="name" type="text" maxlength="30" autocomplete="name" placeholder="请输入您的姓名" aria-required="true"/></div>
          <div ${scope} class="form-group"><label ${scope} class="form-label" for="business-company"><span ${scope} class="required" aria-hidden="true">*</span>公司 / 机构名称</label><input ${scope} class="form-input" id="business-company" name="company" type="text" maxlength="60" autocomplete="organization" placeholder="请输入公司或机构名称" aria-required="true"/></div>
        </div>
        <div ${scope} class="form-row form-row--contact">
          <div ${scope} class="form-group"><label ${scope} class="form-label" for="business-contact"><span ${scope} class="required" aria-hidden="true">*</span>联系方式</label><input ${scope} class="form-input" id="business-contact" name="contact" type="tel" inputmode="numeric" maxlength="11" autocomplete="tel-national" placeholder="请输入手机号" value="${escapeHtml(phone)}" aria-required="true"/></div>
          <div ${scope} class="form-group"><label ${scope} class="form-label" id="business-role-label" for="business-role-trigger">职位 / 角色</label><input ${scope} type="hidden" id="business-role" name="role" value=""/><button ${scope} class="form-select" id="business-role-trigger" type="button" data-biz-toggle="role" aria-haspopup="listbox" aria-expanded="false" aria-controls="business-role-menu" aria-labelledby="business-role-label business-role-text"><span ${scope} class="select-text select-text--placeholder" id="business-role-text">请选择职位 / 角色</span>${downIcon()}</button><div ${scope} class="select-dropdown" id="business-role-menu" role="listbox" aria-labelledby="business-role-label" hidden>${roles.map(role => `<button ${scope} class="select-option" type="button" role="option" data-biz-role="${escapeHtml(role)}" aria-selected="false">${escapeHtml(role)}</button>`).join('')}</div></div>
        </div>
        <div ${scope} class="form-group"><label ${scope} class="form-label" id="business-direction-label" for="business-direction-trigger"><span ${scope} class="required" aria-hidden="true">*</span>合作方向</label><input ${scope} type="hidden" id="business-direction" name="direction" value="[]"/><button ${scope} class="form-select form-select--multi" id="business-direction-trigger" type="button" data-biz-toggle="direction" aria-haspopup="listbox" aria-expanded="false" aria-controls="business-direction-menu" aria-labelledby="business-direction-label business-direction-text" aria-required="true"><span ${scope} class="selected-chips" id="business-direction-chips"><span ${scope} class="select-text select-text--placeholder" id="business-direction-text">请选择合作方向（可多选）</span></span>${downIcon()}</button><div ${scope} class="select-dropdown" id="business-direction-menu" role="listbox" aria-multiselectable="true" aria-labelledby="business-direction-label" hidden>${directions.map(direction => `<button ${scope} class="select-option select-option--multi" type="button" role="option" data-biz-direction="${escapeHtml(direction)}" aria-selected="false"><span ${scope} class="select-checkbox" aria-hidden="true">${checkIcon()}</span><span ${scope}>${escapeHtml(direction)}</span></button>`).join('')}</div></div>
        <div ${scope} class="form-group"><label ${scope} class="form-label" for="business-needs"><span ${scope} class="required" aria-hidden="true">*</span>合作需求</label><div ${scope} class="form-textarea-wrap"><textarea ${scope} class="form-textarea" id="business-needs" name="needs" maxlength="500" placeholder="请简要描述项目背景、内容体量、合作目标等信息" aria-required="true" aria-describedby="business-count"></textarea><span ${scope} class="char-count" id="business-count">0 / 500</span></div></div>
        <label ${scope} class="form-agreement"><input ${scope} class="agreement-checkbox" id="business-agreement" name="agreement" type="checkbox" aria-required="true"/><span ${scope} class="agreement-text">我已阅读并同意 <a ${scope} class="agreement-link" href="https://aiqa.weiduanju.com/privacy-policy" target="_blank" rel="noopener">隐私政策</a> ，同意平台为商务合作目的联系我</span></label>
        <div ${scope} class="form-error" id="business-error" role="alert" aria-live="polite"></div>
        <div ${scope} class="form-actions"><button ${scope} class="btn btn-cancel" type="button" data-close>取消</button><button ${scope} class="btn btn-submit is-disabled" id="business-submit" type="submit" disabled>提交合作意向</button></div>
      </form>
    </section>
  </div>`;
}
