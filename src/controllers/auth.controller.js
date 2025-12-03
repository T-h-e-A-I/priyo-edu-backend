import {
  loginWithCredentials,
  fetchUserProfile,
  verifyTokenRemote,
  logoutRemote,
  isAuthConfigured,
} from '../services/oneAuth.service.js';
import {
  findOneAuthUserByUuid,
  upsertOneAuthUserFromProfile,
} from '../services/oneAuthUser.service.js';
import {
  createAccessToken,
  createRefreshToken,
  verifyToken as verifyJwt,
} from '../services/jwt.service.js';

function extractToken(req) {
  const header = req.headers.authorization || '';
  const queryToken = req.query.token;
  const tokenFromHeader = header.replace(/^Token\\s+/i, '').trim();
  return queryToken || tokenFromHeader || '';
}

export async function loginController(req, res) {
  try {
    if (!isAuthConfigured()) {
      return res.status(500).json({ error: 'auth_service_not_configured' });
    }

    const { status, data } = await loginWithCredentials(req.body || {});

    return res.status(status).json(
      data ?? {
        status_code: status,
      },
    );
  } catch (error) {
    console.error('Login failed', error);
    return res.status(500).json({ error: 'login_failed' });
  }
}

export async function profileController(req, res) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(400).json({ error: 'token_required' });
    }

    if (!isAuthConfigured()) {
      return res.status(500).json({ error: 'auth_service_not_configured' });
    }

    const { status, data } = await fetchUserProfile(token);

    return res.status(status).json(
      data ?? {
        status_code: status,
      },
    );
  } catch (error) {
    console.error('Fetching profile failed', error);
    return res.status(500).json({ error: 'profile_failed' });
  }
}

export async function verifyController(req, res) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(400).json({ error: 'token_required' });
    }

    if (!isAuthConfigured()) {
      console.log('AUTH_API_BASE not configured; cannot verify remotely');
      return res.status(500).json({ error: 'auth_service_not_configured' });
    }

    const { status, data: verifyData } = await verifyTokenRemote(token);

    if (!verifyData) {
      return res.status(status).json({ status_code: status });
    }

    if (status < 200 || status >= 300) {
      return res.status(status).json(verifyData);
    }

    const userUuid = verifyData.uuid;

    if (!userUuid) {
      return res.status(status).json(verifyData);
    }

    let user = await findOneAuthUserByUuid(userUuid);

    if (!user) {
      const profileResult = await fetchUserProfile(token);
      user = await upsertOneAuthUserFromProfile(userUuid, profileResult.data);
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return res.status(status).json({
      ...verifyData,
      user,
      tokens: {
        access: accessToken,
        refresh: refreshToken,
      },
    });
  } catch (error) {
    console.error('Token verification failed', error);
    return res.status(500).json({ error: 'verify_failed' });
  }
}

export async function logoutController(req, res) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(400).json({ error: 'token_required' });
    }

    if (!isAuthConfigured()) {
      return res.json({ loggedOut: true, verifiedBy: 'local' });
    }

    const { status, data } = await logoutRemote(token);

    return res.status(status).json(
      data ?? {
        status_code: status,
      },
    );
  } catch (error) {
    console.error('Logout failed', error);
    return res.status(500).json({ error: 'logout_failed' });
  }
}

export async function refreshController(req, res) {
  try {
    const { refresh } = req.body || {};

    if (!refresh) {
      return res.status(400).json({ error: 'refresh_token_required' });
    }

    let decoded;
    try {
      decoded = verifyJwt(refresh);
    } catch (error) {
      return res.status(401).json({ error: 'invalid_refresh_token' });
    }

    const userUuid = decoded?.sub;

    if (!userUuid) {
      return res.status(401).json({ error: 'invalid_refresh_payload' });
    }

    const user = await findOneAuthUserByUuid(userUuid);

    if (!user) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    const accessToken = createAccessToken(user);

    return res.json({
      user,
      tokens: {
        access: accessToken,
        refresh,
      },
    });
  } catch (error) {
    console.error('Refreshing access token failed', error);
    return res.status(500).json({ error: 'refresh_failed' });
  }
}


