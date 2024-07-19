import {Injectable} from "@angular/core";
import {Observable, share} from "rxjs";
import {HttpClient} from "@angular/common/http";

export interface IUser {
  name: string,
  surname: string,
  username: string,
  id: string,
  roleIds: string[],
  twoFactorEnabled: boolean
}

export interface QrData {
  uri: string,
  issuer: string,
  secret: string
}

export interface LoginResponse {
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersCache: {[key: string]: IUser} = {};
  private usersObservableCache: {[key: string]: Observable<IUser>} = {};
  private selfUserObservable: Observable<IUser> | undefined = undefined;
  private selfUser: IUser | undefined = undefined;
  private token: string;

  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.token = window.localStorage.getItem("token") as string;

    this.httpClient = httpClient;
  }

  clearCache() {
    this.selfUserObservable = undefined;
    this.selfUser = undefined;
  }

  refreshToken() {
    this.token = window.localStorage.getItem("token") as string;
  }

  getUsersMe() {
    if(this.selfUser) {
      return new Observable<IUser>((subscriber) => {
        subscriber.next(this.selfUser as IUser);
      });
    }

    if(this.selfUserObservable) {
      console.info("Returning cached user.")
      return this.selfUserObservable;
    }

    console.info("Fetching user.");
    this.selfUserObservable = this.httpClient.get<IUser>("http://localhost:8080/api/users/@me", {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    }).pipe(share());

    this.selfUserObservable.subscribe((user) => {
      this.selfUser = user;
    });

    return this.selfUserObservable;
  }

  login(email: string, password: string, twoFactorCode?: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>("http://localhost:8080/api/auth/login", {
      email,
      password,
      twoFactorCode
    }).pipe(share());
  }

  register(username: string, email: string, name: string, surname: string) {
    return this.httpClient.post("http://localhost:8080/api/users", {
      username,
      email,
      name,
      surname
    });
  }

  edit(username: string, email: string, password: string, name: string, surname: string, id: string) {
    return this.httpClient.patch("http://localhost:8080/api/users/@me", {
      username,
      email,
      password,
      name,
      surname,
      id
    }, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    });
  }

  getUser(userId: string): Observable<IUser> {
    if(this.usersCache[userId]) {
      return new Observable<IUser>((subscriber) => {
        subscriber.next(this.usersCache[userId]);
      });
    }

    if(this.usersObservableCache[userId]) {
      return this.usersObservableCache[userId];
    }

    this.usersObservableCache[userId] = this.httpClient.get<IUser>(`http://localhost:8080/api/users/${userId}`, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    }).pipe(share());

    this.usersObservableCache[userId].subscribe((user) => {
      this.usersCache[userId] = user;
    });

    return this.usersObservableCache[userId];
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
    return this.httpClient.put("http://localhost:8080/api/users/@me/password", {
      oldPassword,
      newPassword,
      confirmPassword
    }, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    });
  }

  get2FASecret() {
    return this.httpClient.get<QrData>("http://localhost:8080/api/users/@me/2faconfig", {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    });
  }

  enable2FA(secret: string, code: string) {
    return this.httpClient.put<void>("http://localhost:8080/api/users/@me/twoFactorCode", {
      secret,
      code
    }, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    });
  }

  disable2FA(code: string) {
    return this.httpClient.put<void>("http://localhost:8080/api/users/@me/twoFactorCode/disable", {
      code
    }, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    });
  }

  updateMe(data: {email?: string, username?: string}) {
    return this.httpClient.patch("http://localhost:8080/api/users/@me", data, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      }
    });
  }
}
