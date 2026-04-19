import { randomUUID } from 'crypto';
const parseJwtExpiryToMs = (expiry) => {
    const match = expiry.trim().match(/^(\d+)([smhd])$/i);
    if (!match)
        return 24 * 60 * 60 * 1000;
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multiplier = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    }[unit] ?? 1000;
    return amount * multiplier;
};
class SessionService {
    constructor() {
        this.sessions = new Map();
        this.lastPrunedAt = 0;
    }
    getPruneIntervalMs() {
        const configured = Number(process.env.SESSION_PRUNE_INTERVAL_MS || 60000);
        if (!Number.isFinite(configured) || configured < 1000) {
            return 60000;
        }
        return configured;
    }
    maybePruneExpiredSessions(now = Date.now()) {
        if (now - this.lastPrunedAt < this.getPruneIntervalMs()) {
            return;
        }
        this.pruneExpiredSessions(now);
        this.lastPrunedAt = now;
    }
    getTtlMs() {
        return parseJwtExpiryToMs(process.env.JWT_EXPIRY || '24h');
    }
    pruneExpiredSessions(now = Date.now()) {
        for (const [sessionId, session] of this.sessions) {
            if (session.expiresAt <= now || session.revokedAt !== null) {
                this.sessions.delete(sessionId);
            }
        }
    }
    createSession(userId) {
        const now = Date.now();
        this.maybePruneExpiredSessions(now);
        const ttlMs = this.getTtlMs();
        const session = {
            id: randomUUID(),
            userId,
            createdAt: now,
            expiresAt: now + ttlMs,
            revokedAt: null,
        };
        this.sessions.set(session.id, session);
        return session;
    }
    isSessionActive(sessionId, userId) {
        const now = Date.now();
        this.maybePruneExpiredSessions(now);
        const session = this.sessions.get(sessionId);
        if (!session)
            return false;
        if (session.userId !== userId)
            return false;
        if (session.revokedAt !== null)
            return false;
        if (session.expiresAt <= now) {
            this.sessions.delete(sessionId);
            return false;
        }
        return true;
    }
    revokeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        session.revokedAt = Date.now();
        this.sessions.delete(sessionId);
    }
}
export default new SessionService();
