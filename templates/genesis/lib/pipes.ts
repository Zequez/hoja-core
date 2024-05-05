import type { Functions as F } from '@server/routes/api/functions';
import { pipeWrapper } from './api-helper';

type FAT<T> = FirstArgumentType<T>;
type ART<T extends (...args: any) => any> = Awaited<ReturnType<T>>;

/* GENERATED */

export const membersWithSharedResources = pipeWrapper<FAT<F['$membersWithSharedResources']>, ART<F['$membersWithSharedResources']>>('membersWithSharedResources');
export const sharedResourcesByMemberId = pipeWrapper<FAT<F['$sharedResourcesByMemberId']>, ART<F['$sharedResourcesByMemberId']>>('sharedResourcesByMemberId');
export const memberSites = pipeWrapper<FAT<F['$memberSites']>, ART<F['$memberSites']>>('memberSites');
export const siteFiles = pipeWrapper<FAT<F['$siteFiles']>, ART<F['$siteFiles']>>('siteFiles');
export const tsites = pipeWrapper<FAT<F['$tsites']>, ART<F['$tsites']>>('tsites');
export const tsite = pipeWrapper<FAT<F['$tsite']>, ART<F['$tsite']>>('tsite');
export const tsiteSetConfig = pipeWrapper<FAT<F['$tsiteSetConfig']>, ART<F['$tsiteSetConfig']>>('tsiteSetConfig');
export const checkSubdomainAvailability = pipeWrapper<FAT<F['$checkSubdomainAvailability']>, ART<F['$checkSubdomainAvailability']>>('checkSubdomainAvailability');
export const tokenFromAccessKey = pipeWrapper<FAT<F['$tokenFromAccessKey']>, ART<F['$tokenFromAccessKey']>>('tokenFromAccessKey');
export const setAccessKey = pipeWrapper<FAT<F['$setAccessKey']>, ART<F['$setAccessKey']>>('setAccessKey');
export const tokenFromMemberCredentials = pipeWrapper<FAT<F['$tokenFromMemberCredentials']>, ART<F['$tokenFromMemberCredentials']>>('tokenFromMemberCredentials');