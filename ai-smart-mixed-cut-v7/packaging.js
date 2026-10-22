// One system font. The production integration supplies the platform font file/version.
export const TITLE_FONT = Object.freeze({id:'source-han-sans',name:'思源黑体',family:'Source Han Sans SC',version:'a4f7cf94edfb9d7ffbdfc4841de276358bd7e0f2',file:'assets/fonts/SourceHanSansSC-Bold.otf'});
export const TITLE_COLORS = Object.freeze([
 {name:'黑色',value:'#000000'},{name:'白色',value:'#FFFFFF'},{name:'黄色',value:'#FFDB00'},
 {name:'绿色',value:'#14CBA8'},{name:'粉色',value:'#FF548D'},{name:'蓝色',value:'#4E76FF'}
]);
export const TITLE_CONTROLS = Object.freeze([
 {key:'titleStrokeWidth',label:'描边宽度',min:0,max:6,unit:'px',value:2},
 {key:'titleFontSize',label:'字号',min:12,max:36,unit:'px',value:22},
 {key:'titleLineSpacing',label:'行间距',min:0,max:20,unit:'px',value:0},
 {key:'titleWidth',label:'标题宽度',min:50,max:100,unit:'%',value:80},
 {key:'titleX',label:'横向位置',min:0,max:100,unit:'%',value:50},
 {key:'titleY',label:'纵向位置',min:0,max:100,unit:'%',value:8}
]);
export const DEFAULT_PACKAGING = Object.freeze({titleFont:TITLE_FONT.id,titleFontVersion:TITLE_FONT.version,titleColor:'#FFDB00',titleStrokeColor:'#FF548D',...Object.fromEntries(TITLE_CONTROLS.map(p=>[p.key,p.value])),bgmVolume:20});
export function titleControlError(c,key){
 if(!c.title)return null;
 const control=TITLE_CONTROLS.find(p=>p.key===key);if(!control)return null;
 const value=c[key]===undefined?control.value:c[key];
 return Number.isInteger(value)&&value>=control.min&&value<=control.max?null:`${control.label}需为${control.min}–${control.max}的整数`;
}
export function titleSettingsError(c){
 if(!c.title)return null;
 for(const [key,label] of [['titleColor','字体颜色'],['titleStrokeColor','描边颜色']])if(!TITLE_COLORS.some(p=>p.value===(c[key]??DEFAULT_PACKAGING[key])))return '请选择'+label;
 return TITLE_CONTROLS.map(p=>titleControlError(c,p.key)).find(Boolean)||null;
}
export function titlePreviewStyle(c){
 const values=Object.fromEntries(TITLE_CONTROLS.map(p=>[p.key,titleControlError(c,p.key)?p.value:(c[p.key]??p.value)]));
 const color=key=>TITLE_COLORS.some(p=>p.value===c[key])?c[key]:DEFAULT_PACKAGING[key];
 const v=values;
 return `--title-color:${color('titleColor')};--title-stroke-color:${color('titleStrokeColor')};--title-stroke:${v.titleStrokeWidth};--title-size:${v.titleFontSize};--title-spacing:${v.titleLineSpacing};width:${v.titleWidth}%;left:${(100-v.titleWidth)*v.titleX/100}%;top:${v.titleY}%;transform:translateY(-${v.titleY}%);`;
}
export function bgmVolumeError(c){
 if(c.bgm===false)return null;
 const value=c.bgmVolume===undefined?DEFAULT_PACKAGING.bgmVolume:c.bgmVolume;
 return Number.isInteger(value)&&value>=0&&value<=100?null:'BGM音量需为0–100的整数';
}
export function bgmVolume(c){return bgmVolumeError(c)?DEFAULT_PACKAGING.bgmVolume:(c.bgmVolume??DEFAULT_PACKAGING.bgmVolume);}
