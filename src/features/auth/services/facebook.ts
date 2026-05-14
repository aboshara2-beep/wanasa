import * as WebBrowser  from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const FB_APP_ID    = '2476782436090392';
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'wanasa' });

export async function loginWithFacebook(): Promise<string> {
  const request = new AuthSession.AuthRequest({
    clientId:     FB_APP_ID,
    scopes:       ['public_profile', 'email'],
    redirectUri:  REDIRECT_URI,
    responseType: AuthSession.ResponseType.Token,
  });

  const result = await request.promptAsync({
    authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
  });

  if (result.type === 'success') {
    return result.params.access_token;
  }
  throw new Error('تم إلغاء تسجيل الدخول');
}
