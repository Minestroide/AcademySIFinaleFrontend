import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, share} from "rxjs";

export enum RoleType {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT"
}

export interface IRole {
  type: RoleType,
  id: string
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private token: string;
  private httpClient: HttpClient;
  private rolesObservable: Observable<IRole[]> | undefined = undefined;
  private roles: IRole[] | undefined = undefined;

  constructor(httpClient: HttpClient) {
    this.token = window.localStorage.getItem('token') as string;
    this.httpClient = httpClient;
  }

  refreshToken() {
    this.token = window.localStorage.getItem('token') as string;
  }

  clearCache() {
    this.roles = [];
    this.rolesObservable = undefined;
  }

  getRoles(): Observable<IRole[]> {
    if(this.roles) return new Observable((observer) => {
      observer.next(this.roles);
    });

    if(this.rolesObservable) return this.rolesObservable;

    this.rolesObservable = this.httpClient.get<IRole[]>(`http://localhost:8080/api/roles`).pipe(share());

    this.rolesObservable.subscribe((contacts) => {
      this.roles = contacts;
    });

    return this.rolesObservable;
  }
}
