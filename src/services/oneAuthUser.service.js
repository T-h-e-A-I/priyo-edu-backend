import { pool } from '../../database/pool.js';

// Helper to normalize the basic profile information we care about.
function extractBasicProfile(uuid, profile) {
  const nestedProfile = profile?.profile || {};

  return {
    uuid,
    name: nestedProfile.name || profile?.name || null,
    mobile: profile?.mobile || null,
    externalId: typeof profile?.id === 'number' ? profile.id : null,
    image: nestedProfile.image || profile?.image || null,
  };
}

export async function findOneAuthUserByUuid(uuid) {
  const result = await pool.query(
    `SELECT id, uuid, name, mobile, external_id AS "externalId", image, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM one_auth_users
     WHERE uuid = $1`,
    [uuid],
  );

  return result.rows[0] || null;
}

export async function upsertOneAuthUserFromProfile(uuid, profile) {
  const basic = extractBasicProfile(uuid, profile);

  const result = await pool.query(
    `
      INSERT INTO one_auth_users (uuid, name, mobile, external_id, image)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (uuid) DO UPDATE
      SET
        name = EXCLUDED.name,
        mobile = EXCLUDED.mobile,
        external_id = EXCLUDED.external_id,
        image = EXCLUDED.image,
        updated_at = NOW()
      RETURNING id,
                uuid,
                name,
                mobile,
                external_id AS "externalId",
                image,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
    `,
    [basic.uuid, basic.name, basic.mobile, basic.externalId, basic.image],
  );

  return result.rows[0];
}


