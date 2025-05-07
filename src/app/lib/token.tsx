import {jwtDecode} from "jwt-decode";
import moment from "moment";

export function getAuthorization(): string {
    const token =  localStorage.getItem("access_token");
    if (token == null) {
        return "";
    }
    return token;
}

export interface JwtPayload {
    sub: string,
    company: string,
    exp: bigint
}

export function jwtPayload(): JwtPayload | null {
    const authorization = getAuthorization();
    if (authorization == null || authorization.length == 0) {
        return null;
    }
    if (authorization.startsWith('Bearer ')) {
        const token = authorization.substring(7, authorization.length);
        return jwtDecode(token) as JwtPayload
    }
    return null;   
}

export function getPayloadFrom(token: string): JwtPayload {
    if (token == null || token.length == 0) {
        throw new Error("Invalid token");
    }
    return jwtDecode(token) as JwtPayload;
}

/// 是否已登录
export function isValidAuthorization(): boolean {
    const payload = jwtPayload();
    if (payload == null)
        return false;
    // 当前毫秒数(UNIX timestamp in milliseconds)
    const now = moment().valueOf() / 1000;
    // console.log("now:" + now);
    // console.log("exp:" + payload.exp);
    if (payload.exp <= now) {
        return false;
    }
    return true;
}