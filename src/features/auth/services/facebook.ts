import * as WebBrowser  from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const FB_APP_ID    = '2476782436090392';
const REDIRECT_URI = 'https://auth.expo.io/@0911097629you/wanasa';

export async function loginWithFacebook(): Promise<string> {
  const request = new AuthSession.AuthRequest({
    clientId:     FB_APP_ID,
    scopes:       ['public_profile', 'email'],  // ✅ كلاهما
    redirectUri:  REDIRECT_URI,
    responseType: AuthSession.ResponseType.Token,
    extraParams: {
      display: 'popup',
      auth_type: 'rerequest',
    },
  });

  const result = await request.promptAsync({
    authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
  });

  if (result.type === 'success' && result.params?.access_token) {
    return result.params.access_token;
  }
  throw new Error(
    result.type === 'cancel' ? 'تم إلغاء تسجيل الدخول' : 'فشل تسجيل الدخول'
  );
}
