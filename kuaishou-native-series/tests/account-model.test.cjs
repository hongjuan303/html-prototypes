const {test}=require('node:test');
const assert=require('node:assert/strict');
const A=require('../account-model.js');
const staff=[{id:'s1'},{id:'s2'}];
const seed=()=>[{id:'ks1',uid:'10001',name:'旧名称',operatorId:'s1',valid:false,updatedAt:'old'}];
test('editing only changes the assigned employee and update time',()=>{
  const rows=seed(),before=structuredClone(rows);
  assert.ok(A.setOperator(rows,'ks1','unknown',staff,'new').error);
  assert.deepEqual(rows,before);
  assert.ok(A.setOperator(rows,'ks1','s2',staff,'new').row);
  assert.deepEqual(rows,[{...before[0],operatorId:'s2',updatedAt:'new'}]);
});
test('reauthorization preserves account and operator identity; wrong account is rejected',()=>{
  const rows=seed(),before=structuredClone(rows);
  assert.ok(A.authorize(rows,{targetId:'ks1',profile:{name:'其他账号',uid:'999'},time:'new'}).error);
  assert.deepEqual(rows,before);
  const result=A.authorize(rows,{targetId:'ks1',profile:{name:'新名称',uid:'10001'},operatorId:'s2',time:'new'});
  assert.equal(result.created,false);assert.equal(rows.length,1);
  assert.deepEqual(rows,[{...before[0],name:'新名称',valid:true,updatedAt:'new'}]);
});
test('adding accounts rejects duplicates and supports upload account model',()=>{
  const rows=seed(),before=structuredClone(rows);
  assert.ok(A.authorize(rows,{profile:{id:'different',uid:'10001',name:'重复'}}).error);
  assert.ok(A.authorize(rows,{profile:{id:'ks1',uid:'10002',name:'冲突'}}).error);
  assert.deepEqual(rows,before);
  const result=A.authorize(rows,{profile:{id:'ks2',uid:'10002',name:'新账号'},operatorId:'s1',time:'new'});
  assert.equal(result.created,true);assert.equal(rows[0].valid,true);assert.equal(rows[0].operatorId,'s1');
  assert.equal(rows[1].id,'ks1');
  assert.equal(A.normalize({...rows[0],operatorId:'deleted'},staff).operatorId,'');
});
