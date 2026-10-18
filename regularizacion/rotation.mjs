// Source: acta CSD jornada MTE, 13/05/2026, sections 3.1–3.4, PDF pp. 4–6.
// Documentary table preserved in Consulta Convenio migration 202609280004.
export const evidence = Object.freeze({
  title: 'Acta CSD de 13/05/2026 — jornada y regularización MTE',
  filename: '20260513 XXII JORNADA MTE.pdf',
  sha256: 'c9c19383040e32b34d77b8d7686a0c94449053a6fcb1c79675a8efefa803aae4',
  pages: '4–6', firstYear: 2027, lastTableYear: 2039,
  continuation: 'continuous',
  continuationBasis: 'Confirmación expresa del usuario, 18/10/2026: continuidad anual.',
});
export const blocks = Object.freeze([1,13,2,12,3,11,4,10,5,9,6,8,7]);
export function validateAssignment(value) {
  if (!value || value.schema !== 'scmm-mte-assignment-v1' || value.base_year !== 2027 ||
      !Number.isInteger(value.initial_block) || !blocks.includes(value.initial_block) ||
      !['A','B','C'].includes(value.group) || !Number.isInteger(value.subgroup) ||
      value.subgroup < 1 || value.subgroup > 4 ||
      typeof value.source_reference !== 'string' || !value.source_reference.trim()) {
    throw Error('La asignación debe indicar esquema v1, año base 2027, bloque 1–13, grupo A/B/C, subgrupo 1–4 y referencia del reparto oficial.');
  }
  // Whitelist: do not retain names, DNE or unexpected fields from uploaded files.
  return {schema:value.schema,base_year:2027,initial_block:value.initial_block,
    group:value.group,subgroup:value.subgroup,source_reference:value.source_reference.trim()};
}
export function parseYear(value) {
  if (!/^\d{4,}$/.test(String(value))) throw Error('Introduce un año entero desde 2027.');
  const year=BigInt(value);
  if(year<2027n) throw Error('La rotación comienza en 2027.');
  return year;
}
export function slotOrder(offset) {
  const groups=['A','B','C'], result=[];
  for(let g=0;g<3;g++) for(let s=0;s<4;s++)
    result.push(groups[(g+Number(offset%3n))%3]+((s+Number(offset%4n))%4+1));
  return result;
}
export function calculate(value,yearInput) {
  const a=validateAssignment(value),year=parseYear(yearInput),elapsed=year-2027n;
  const blockOffset=Number(elapsed%13n);
  const block=blocks[(blocks.indexOf(a.initial_block)+blockOffset)%13];
  const slots=slotOrder(elapsed);
  const within=slots.indexOf(a.group+a.subgroup)+1;
  return {year:String(year),block,permanentSlot:a.group+a.subgroup,order:slots,
    withinBlockPriority:within,subgroupPriority:(block-1)*12+within,
    documentaryRange:year<=2039n,continuation:evidence.continuation};
}
export function lotteryStart(number,population){
  if(!/^\d{1,5}$/.test(String(number)) || !/^\d+$/.test(String(population)) || BigInt(population)<1n)
    throw Error('Indica un número del sorteo entre 00000 y 99999 y una plantilla MTE positiva.');
  return String(BigInt(number)*BigInt(population)/100000n+1n);
}
