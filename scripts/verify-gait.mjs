import assert from 'node:assert/strict';
import {legPose,UPPER_LENGTH,LOWER_LENGTH} from '../lib/gait.ts';
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
let cases=0;
for(const gait of ['alternating','wave'])for(const side of [-1,1])for(let index=0;index<4;index++)for(const stride of [.15,.55,.9])for(const lift of [.1,.55,.95])for(let t=0;t<64;t++){
  const phase=t/64*Math.PI*2,bodyHeight=1.16+Math.sin(phase*2)*.025;
  const pose=legPose({gait,side,index,stride,lift,phase,bodyHeight});
  assert.ok(pose.reachable,'Target must remain within the two-link reach envelope');
  assert.ok([...pose.hip,...pose.knee,...pose.foot].every(Number.isFinite));
  assert.ok(pose.foot[1]>=.07-1e-9,'Foot must not pass below the nominal contact plane');
  assert.ok(Math.abs(distance(pose.hip,pose.knee)-UPPER_LENGTH)<1e-9,'Upper link length must remain fixed');
  assert.ok(Math.abs(distance(pose.knee,pose.foot)-LOWER_LENGTH)<1e-9,'Lower link length must remain fixed');
  const next=legPose({gait,side,index,stride,lift,phase:phase+Math.PI*2,bodyHeight});
  assert.ok(distance(pose.foot,next.foot)<1e-9,'Gait must be periodic');cases++;
}
console.log(`PASS: ${cases} kinematic configurations; reach, fixed link lengths, finite coordinates, ground clearance and cycle closure.`);
