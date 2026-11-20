import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {matchesAdminPassword,authorizeAdmin} from '../lib/admin.ts';
import {createSubmission,listSubmissions,getSubmission,saveSubmission} from '../lib/store.ts';
import type {Submission} from '../lib/submissions.ts';
test('admin uses dedicated credentials, never database credentials, and checks origin',async()=>{
 process.env.ADMIN_PASSWORD_SHA256=createHash('sha256').update('local-test-password').digest('hex');
 process.env.KV_REST_API_TOKEN='not-an-admin-password';
 assert.equal(matchesAdminPassword('local-test-password'),true);
 assert.equal(matchesAdminPassword('not-an-admin-password'),false);
 assert.equal(matchesAdminPassword('wrong'),false);
 assert.equal(await authorizeAdmin(new Request('http://localhost/api/admin',{headers:{origin:'https://another.example',authorization:'Bearer local-test-password'}})),403);
 assert.equal(await authorizeAdmin(new Request('http://localhost/api/admin',{headers:{authorization:'Bearer local-test-password'}})),200);
 delete process.env.ADMIN_PASSWORD_SHA256;delete process.env.KV_REST_API_TOKEN;
 assert.equal(matchesAdminPassword('local-test-password'),false);
});
test('submission persists once and review retains the original proof',async()=>{
 const s:Submission={id:'test001',bountyId:'001',wallet:'11111111111111111111111111111111',tweetUrl:'https://x.com/qa/status/123456',handle:'qa',note:'test',status:'pending',createdAt:new Date().toISOString(),reviewedAt:null,reviewNote:'',payoutTx:null};
 const results=await Promise.all([createSubmission(s),createSubmission({...s,id:'test002'})]);
 assert.deepEqual(results,[true,false]);assert.equal((await listSubmissions()).length,1);
 await saveSubmission({...s,status:'approved',reviewNote:'Clip reviewed'},false);
 assert.equal((await getSubmission(s.id))?.tweetUrl,s.tweetUrl);
 assert.equal((await getSubmission(s.id))?.status,'approved');
});
