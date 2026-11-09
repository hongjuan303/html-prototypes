import {persistReviewFiles} from './review-files.js?v=20261109-channels';

export function canRecoverAttachment(meta){
 return !!meta&&typeof meta.previewId==='string'&&!!meta.previewId&&typeof meta.name==='string'&&!!meta.name&&Number.isFinite(meta.size)&&meta.size>=0;
}

export function validateRecoveryFile(meta,file){
 if(!canRecoverAttachment(meta))throw new Error('此附件缺少原文件标识或大小，暂不能恢复。');
 if(typeof File==='undefined'||!(file instanceof File))throw new Error('请选择需要恢复的本地原件。');
 if(file.name.normalize('NFC')!==meta.name.normalize('NFC'))throw new Error('文件名不一致，请选择原件“'+meta.name+'”。');
 if(file.size!==meta.size)throw new Error('文件大小与原记录不一致，请选择上传时的原文件，不要使用修改后的版本。');
 return true;
}

// Restore the bytes behind the existing attachment; never create a new business version.
export async function recoverAttachment(meta,file,uploads){
 validateRecoveryFile(meta,file);
 if(!uploads||typeof uploads.set!=='function')throw new Error('附件恢复环境未就绪，请刷新后重试。');
 const previous=uploads.get(meta.previewId),temporary=new Map([[meta.previewId,{file}]]);
 const result=await persistReviewFiles([meta],temporary);
 if(!result.saved.includes(meta.previewId))throw new Error('附件原件未能保存，请重新选择文件。');
 const entry={file,url:URL.createObjectURL(file)};
 uploads.set(meta.previewId,entry);
 if(previous?.url?.startsWith('blob:'))URL.revokeObjectURL(previous.url);
 return {previewId:meta.previewId,...entry};
}
