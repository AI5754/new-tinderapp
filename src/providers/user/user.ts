import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import { Injectable } from '@angular/core';
//import 'rxjs/add/operator/map';
import PouchDB from 'pouchdb';

@Injectable()
export class UserProvider {

  public pdb;
  public remote;
  //users;

  createPouchDB() {
    PouchDB.plugin(cordovaSqlitePlugin);
    this.pdb = new PouchDB('users');
    this.remote = 'http://localhost:5984/users';

    let options = {
      live: true,
      retry: true,
      continuous: true
    };

    this.pdb.sync(this.remote, options);
  }

  create(userToCreate) {
    return this.pdb.post(userToCreate);
  }

  update(users) {
    return this.pdb.put(users);
  }

  delete(users) {
    return this.pdb.remove(users);
  }

  read() {
    let pdb = this.pdb;

    function allDocs() {

      let _userss = pdb.allDocs({ include_docs: true })
        .then(docs => {
          return docs.rows;
        });

      return Promise.resolve(_userss);
    };
    return allDocs();
  }

  getPic(usersId){
    return (this.remote + "/" + usersId + "/pic.png");
  }
}
