import express from 'express';
import bodyParser from 'body-parser';
import { T, query, Member, Site, File_ } from '@db';
import { sanitizeMember, tokenData, tokenFromHeader } from '@server/lib/utils';

import type { SiteWithFiles } from '@db';

const jsonParser = bodyParser.json();

const router = express.Router();

export type RouteResourceMembers = Omit<Member, 'passphrase'>[];
router.get('/members', async (req, res) => {
  const members = await T.members.all();
  return res.status(200).json(members.map(sanitizeMember));
});

export type RouteResourceMembersId = Omit<Member, 'passphrase'> & { sites: SiteWithFiles[] };
router.get('/members/:id', async (req, res) => {
  const member = await T.members.withSitesAndFiles(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  return res.status(200).json({
    ...sanitizeMember(member),
  } as RouteResourceMembersId);
});

export type RouteResourcePostFileIdQuery = {
  id: string;
  data: string;
  name: string;
};
export type RouteResourcePostFileId = Record<PropertyKey, never>;
router.post('/files/:id', jsonParser, async (req, res) => {
  const token = tokenFromHeader(req.headers);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const file = await T.files.get(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  const { id } = tokenData(token);
  const site = await T.sites.get(file.site_id);
  const member = await T.members.get(site.member_id);
  if (id !== member.id) return res.status(401).json({ error: 'Unauthorized' });
  const { data, name } = req.body;
  const bufferData = Buffer.from(data, 'base64');
  await T.files.update(file.id, { data: bufferData, data_size: bufferData.length, name });
  return res.status(200).json({});
});

router.get('/sites', async (req, res) => {
  const sites = await T.sites.all();
  return res.status(200).json(sites);
});

export default router;
