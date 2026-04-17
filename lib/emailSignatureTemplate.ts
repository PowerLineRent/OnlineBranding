import {
  getEmailSignatureIconFileName,
  getPreferredEmailSignatureAssetUrl,
} from '@/lib/emailSignatureAssetUrls';

export type SignatureFormData = {
  name: string;
  title: string;
  office: string;
  mobile: string;
  fax: string;
  email: string;
  addr1: string;
  addr2: string;
};

export const DEFAULT_SIGNATURE_DATA: SignatureFormData = {
  name: 'Tim Kingery',
  title: 'President',
  office: '540-682-2126',
  mobile: '540-815-3752',
  fax: '540-345-4400',
  email: 'timkingery@plrei.com',
  addr1: '42 Noble Avenue, NE',
  addr2: 'Roanoke, VA 24012',
};

export const LOGO_FILE = 'EmailSignatureLogo-V3.png';
export const ADDRESS_ICON_FILE = getEmailSignatureIconFileName('address');
export const PHONE_ICON_FILE = getEmailSignatureIconFileName('phone');
export const EMAIL_ICON_FILE = getEmailSignatureIconFileName('email');
export const LINK_ICON_FILE = getEmailSignatureIconFileName('link');

export const SIGNATURE_ASSET_FILES = [
  LOGO_FILE,
  ADDRESS_ICON_FILE,
  PHONE_ICON_FILE,
  EMAIL_ICON_FILE,
  LINK_ICON_FILE,
] as const;

export type SignatureAssetUrls = {
  logo: string;
  address: string;
  phone: string;
  email: string;
  link: string;
};

export const DEFAULT_SIGNATURE_ASSET_URLS: SignatureAssetUrls = {
  logo: getPreferredEmailSignatureAssetUrl(LOGO_FILE),
  address: getPreferredEmailSignatureAssetUrl(ADDRESS_ICON_FILE),
  phone: getPreferredEmailSignatureAssetUrl(PHONE_ICON_FILE),
  email: getPreferredEmailSignatureAssetUrl(EMAIL_ICON_FILE),
  link: getPreferredEmailSignatureAssetUrl(LINK_ICON_FILE),
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildSignatureHtml(data: SignatureFormData, urls: SignatureAssetUrls): string {
  const hasAddr = !!(data.addr1 || data.addr2);
  const hasBothAddr = !!(data.addr1 && data.addr2);

  return `<table cellspacing="0" cellpadding="0" style="FONT-FAMILY: Aptos, Calibri, sans-serif; COLOR: #000080; width:480px; background: transparent !important;">
                        <tbody>
                            <tr>
                                <td width="126" style="FONT-SIZE: 10pt; FONT-FAMILY: Aptos, Calibri, sans-serif; COLOR: #000080; line-height:12pt; padding-bottom:23px; padding-right:10px; text-align:center; width:126px; vertical-align: top" valign="bottom">
                                    <a href="https://plrei.com" target="_blank" style="text-decoration: none; border: 0;">
                                        <img alt="Logo" width="94" border="0" style="width:94px; height:auto; border:0; display:block;" src="${esc(urls.logo)}">
                                    </a>
                                </td>
                                <td valign="top" style="padding-bottom: 20px; FONT-FAMILY: Aptos, Calibri, sans-serif; vertical-align: top;">

                                    <p style="border-bottom:3px solid #000080; padding-bottom: 5px; margin: 0 0 8px 0;">
                                        <span style="FONT-SIZE: 20px; COLOR: #000000; FONT-FAMILY: Aptos, Calibri, sans-serif;">
                                            <strong id="sig-name">${esc(data.name)}</strong>
                                        </span>
                                        <br>
                                        <span id="sig-title" style="FONT-SIZE: 16px; COLOR: #000000;">${esc(data.title)}</span>
                                    </p>

                                    <p style="margin: 0 0 10px 0;">
                                        <span style="FONT-SIZE: 18px; COLOR: #000000;">
                                            <strong>Power Line Rent-E-Quip, Inc.</strong>
                                        </span>
                                    </p>

                                    <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1; border-collapse: collapse;">
                                        <tbody>
                                            <tr id="sig-addr-row" style="height: ${hasBothAddr ? '36' : '26'}px;${!hasAddr ? ' display: none;' : ''}">
                                                <td width="26" valign="top" style="width: 26px; vertical-align: top; padding-top: 4px;">
                                                    <img src="${esc(urls.address)}" alt="" width="18" height="18" border="0" style="display:block;">
                                                </td>
                                                <td style="padding: 0 0 0 4px; font-size: 14px; color: #000000; line-height: 1.5;">
                                                    <span id="sig-addr1" style="font-size:14px;color:#000000;">${esc(data.addr1)}</span>${hasBothAddr ? '<br id="sig-addr-br">' : '<br id="sig-addr-br" style="display: none;">'}<span id="sig-addr2" style="font-size:14px;color:#000000;">${esc(data.addr2)}</span>
                                                </td>
                                            </tr>
                                            <tr id="sig-office-row" style="height: 26px;${!data.office ? ' display: none;' : ''}">
                                                <td width="26" valign="middle" style="width: 26px; vertical-align: middle;">
                                                    <img src="${esc(urls.phone)}" alt="" width="18" height="18" border="0" style="display:block;">
                                                </td>
                                                <td style="padding: 0 0 0 4px; font-size: 14px; color: #000000;">
                                                    <span style="font-size:14px;color:#000000;">Office: <span id="sig-office">${esc(data.office)}</span></span>
                                                </td>
                                            </tr>
                                            <tr id="sig-mobile-row" style="height: 26px;${!data.mobile ? ' display: none;' : ''}">
                                                <td width="26" valign="middle" style="width: 26px; vertical-align: middle;">
                                                    <img src="${esc(urls.phone)}" alt="" width="18" height="18" border="0" style="display:block;">
                                                </td>
                                                <td style="padding: 0 0 0 4px; font-size: 14px; color: #000000;">
                                                    <span style="font-size:14px;color:#000000;">Mobile: <span id="sig-mobile">${esc(data.mobile)}</span></span>
                                                </td>
                                            </tr>
                                            <tr id="sig-fax-row" style="height: 26px;${!data.fax ? ' display: none;' : ''}">
                                                <td width="26" valign="middle" style="width: 26px; vertical-align: middle;">
                                                    <img src="${esc(urls.phone)}" alt="" width="18" height="18" border="0" style="display:block;">
                                                </td>
                                                <td style="padding: 0 0 0 4px; font-size: 14px; color: #000000;">
                                                    <span style="font-size:14px;color:#000000;">Fax: <span id="sig-fax">${esc(data.fax)}</span></span>
                                                </td>
                                            </tr>
                                            <tr id="sig-email-row" style="height: 26px;${!data.email ? ' display: none;' : ''}">
                                                <td width="26" valign="middle" style="width: 26px; vertical-align: middle;">
                                                    <img src="${esc(urls.email)}" alt="" width="18" height="18" border="0" style="display:block;">
                                                </td>
                                                <td style="padding: 0 0 0 4px; font-size: 14px; color: #000000;">
                                                    <a id="sig-email-link" href="mailto:${esc(data.email)}" style="font-size:14px;color:#000000;text-decoration:none;"><span id="sig-email" style="text-decoration:none;color:#000080;">${esc(data.email)}</span></a>
                                                </td>
                                            </tr>
                                            <tr id="sig-web-row" style="height: 26px;">
                                                <td width="26" valign="middle" style="width: 26px; vertical-align: middle;">
                                                    <img src="${esc(urls.link)}" alt="" width="18" height="18" border="0" style="display:block;">
                                                </td>
                                                <td style="padding: 0 0 0 4px; font-size: 14px; color: #000080;">
                                                    <a href="https://www.plrei.com" style="font-size:14px;color:#000080;text-decoration:none;"><span style="text-decoration:none;color:#000080;">www.plrei.com</span></a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>`;
}

