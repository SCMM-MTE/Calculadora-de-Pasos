import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculate,lotteryStart,validateAssignment} from './rotation.mjs';
const a={schema:'scmm-mte-assignment-v1',base_year:2027,initial_block:1,group:'A',subgroup:1,source_reference:'Fixture de desarrollo, acta p.6; no reparto real'};
test('reproduce filas literales de la tabla y conserva la asignación personal',()=>{
 const cases=[['2027',1,1,['A1','A2','A3','A4','B1','B2','B3','B4','C1','C2','C3','C4']],['2028',13,12,['B2','B3','B4','B1','C2','C3','C4','C1','A2','A3','A4','A1']],['2029',2,7,['C3','C4','C1','C2','A3','A4','A1','A2','B3','B4','B1','B2']],['2039',7,1,['A1','A2','A3','A4','B1','B2','B3','B4','C1','C2','C3','C4']]];
 for(const [year,block,priority,order] of cases){const r=calculate(a,year);assert.equal(r.block,block);assert.equal(r.withinBlockPriority,priority);assert.deepEqual(r.order,order);assert.equal(r.permanentSlot,'A1');assert.equal(r.documentaryRange,true)}
});
test('no presenta como documental ninguna de las dos continuidades tras 2039',()=>{
 const continuous=calculate(a,'2040'),reset=calculate(a,'2040','repeat13');
 assert.equal(continuous.documentaryRange,false);assert.equal(reset.documentaryRange,false);
 assert.equal(continuous.block,1);assert.equal(reset.block,1);
 assert.equal(continuous.withinBlockPriority,12);assert.equal(reset.withinBlockPriority,1);
});
test('no trunca años por precisión numérica ni fija máximo arbitrario',()=>{
 const year='10000000000000000000000000000000000000000';
 const r=calculate(a,year);assert.equal(r.year,year);assert.ok(r.block>=1&&r.block<=13);
 assert.equal(calculate(a,String(BigInt(year)+156n)).subgroupPriority,r.subgroupPriority);
});
test('las 156 asignaciones tienen prioridades únicas cada año',()=>{
 for(let y=2027;y<2183;y++){
  const all=[];for(let block=1;block<=13;block++)for(const group of ['A','B','C'])for(let subgroup=1;subgroup<=4;subgroup++)all.push(calculate({...a,initial_block:block,group,subgroup},String(y)).subgroupPriority);
  assert.equal(new Set(all).size,156);
 }
});
test('rechaza entradas incompletas, años anteriores, decimales y no conserva datos personales',()=>{
 for(const bad of [{...a,initial_block:0},{...a,subgroup:5},{...a,group:'D'},{...a,base_year:2028},{...a,source_reference:''}])assert.throws(()=>validateAssignment(bad));
 for(const y of ['2026','2027.5','2e9','no'])assert.throws(()=>calculate(a,y));
 assert.deepEqual(validateAssignment({...a,name:'No almacenar',dne:'99999'}),a);
});
test('sorteo: extremos y plantilla exacta de precisión arbitraria',()=>{
 assert.equal(lotteryStart('00000','2100'),'1');assert.equal(lotteryStart('99999','2100'),'2100');assert.equal(lotteryStart('50000','2100'),'1051');
 assert.equal(lotteryStart('50000','100000000000000000000'),'50000000000000000001');
 for(const x of [['100000','2100'],['-1','2100'],['12','0'],['1.5','2']])assert.throws(()=>lotteryStart(...x));
});
