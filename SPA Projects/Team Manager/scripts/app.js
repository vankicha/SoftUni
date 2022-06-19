const app = Sammy('#main', function () {
    this.use('Handlebars', 'hbs');

    //GET
    this.get('#/home', function (ctx) {
        getTeams()
            .then(() => {
                getUserInfo(ctx);
                getInfoForHome(ctx);
                loadHeaderAndFooter(ctx)
                    .then(function () {
                        this.partial('./templates/home/home.hbs');
                    });
            });
    });

    this.get('#/about', function (ctx) {

        getUserInfo(ctx);
        loadHeaderAndFooter(ctx)
            .then(function () {
                this.partial('./templates/about/about.hbs');
            });
    });

    this.get('#/login', function (ctx) {
        loadHeaderAndFooter(ctx)
            .then(function () {
                this.loadPartials({
                    'loginForm': './templates/login/loginForm.hbs'
                })
            })
            .then(function () {
                this.partial('./templates/login/loginPage.hbs');
            });
    });

    this.get('#/register', function (ctx) {
        loadHeaderAndFooter(ctx)
            .then(function () {
                this.loadPartials({
                    'registerForm': './templates/register/registerForm.hbs'
                })
            })
            .then(function () {
                this.partial('./templates/register/registerPage.hbs');
            });
    });

    this.get('#/logout', function (ctx) {

        firebase.auth()
            .signOut()
            .then(() => {
                localStorage.removeItem('userInfo');
                localStorage.removeItem('teams');
                validInfo('Logged out!');
                ctx.redirect('#/home');
            })
            .catch((e) => invalidInfo(e.message));
    });

    this.get('#/catalog', function (ctx) {
        getUserInfo(ctx);
        getTeams()
            .then(() => {
                getUserInfoForCatalog(ctx);
                let teams = localStorage.getItem('teams');
                ctx.teams = JSON.parse(teams);
            })
            .then(() => {
                loadHeaderAndFooter(ctx)
                    .then(function () {
                        this.loadPartials({
                            'team': './templates/catalog/team.hbs'
                        })
                    })
                    .then(function () {
                        this.partial('./templates/catalog/teamCatalog.hbs');
                    });
            });
    });

    this.get('#/create', function (ctx) {

        getUserInfo(ctx);
        loadHeaderAndFooter(ctx)
            .then(function () {
                this.loadPartials({
                    'createForm': './templates/create/createForm.hbs'
                })
            })
            .then(function () {
                this.partial('./templates/create/createPage.hbs');
            });
    });

    this.get(`#/catalog/:${(this.getLocation()).split(':')[1]}`, function (ctx) {

        getUserInfo(ctx);
        getUserInfoForCatalog(ctx);
        loadHeaderAndFooter(ctx)
            .then(function () {
                let id = ctx.path.split(':')[1];
                ctx.teamId = id;

                this.loadPartials({
                    'teamMember': './templates/catalog/teamMember.hbs',
                    'teamControls': './templates/catalog/teamControls.hbs'
                })
            })
            .then(function () {
                getTeamInfo(ctx);
                getInfoForDetails(ctx);
                this.partial('./templates/catalog/details.hbs');
            })
    })

    this.get(`#/edit/:${(this.getLocation()).split(':')[1]}`, function (ctx) {
        getUserInfo(ctx);
        loadHeaderAndFooter(ctx)
            .then(function () {
                let teams = JSON.parse(localStorage.getItem('teams'));
                let id = ctx.path.split(':')[1];
                let team = teams.find(t => t._id === id);
                let { name, comment } = team;

                ctx.teamId = id;
                ctx.name = name;
                ctx.comment = comment;

                this.loadPartials({
                    'editForm': './templates/edit/editForm.hbs',
                })
            })
            .then(function () {
                this.partial('./templates/edit/editPage.hbs');
            })
    })

    this.get(`#/join/:${(this.getLocation()).split(':')[1]}`, function (ctx) {

        let id = ctx.path.split(':')[1];
        let teams = JSON.parse(localStorage.getItem('teams'));
        let userInfo = JSON.parse(localStorage.getItem('userInfo'));
        let memberName = userInfo.email.split('@')[0].toUpperCase();

        if (teams.find(t => t.members.includes(memberName))) {
            invalidInfo(`You are already in a team. You can't join another one!`);
            return;
        }

        let { members } = teams.find(t => t._id === id);
        members.push(memberName);
        findTeamKey(id)
            .then((key) => {
                let patchInfo = {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ members })
                }

                fetch(`<URL_HERE>`, patchInfo)
                    .then(() => {
                        ctx.redirect('#/catalog')
                    });
            })
    })

    this.get('#/leave', function (ctx) {
        let teams = JSON.parse(localStorage.getItem('teams'));
        let userInfo = JSON.parse(localStorage.getItem('userInfo'));
        let memberName = userInfo.email.split('@')[0].toUpperCase();
        let team = teams.find(t => t.members.includes(memberName));
        let { members, _id } = team;

        if (team.author === memberName) {
            invalidInfo(`You can't leave your own team!`);
            return;
        }

        let memberIndex = members.indexOf(memberName);
        members.splice(memberIndex, 1);

        findTeamKey(_id)
            .then((key) => {
                let patchInfo = {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ members })
                }

                fetch(`<URL_HERE>`, patchInfo)
                    .then(() => {
                        ctx.redirect('#/catalog')
                    });
            })
    })

    //POST
    this.post('#/register', function (ctx) {

        let { email, password, repeatPassword } = ctx.params;

        if (password !== repeatPassword) {
            invalidInfo('Passwords are not the same!');
            return;
        }

        firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                validInfo('Succesfully registered!');
                ctx.redirect('#/login')
            })
            .catch((e) => invalidInfo(e.message));
    });

    this.post('#/login', function (ctx) {

        let { email, password } = ctx.params;

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((userInfo) => {
                let { user: { email } } = userInfo;
                localStorage.setItem('userInfo', JSON.stringify({ email }));
                validInfo('You have logged in!');
                ctx.redirect('#/home');
            })
            .catch((e) => invalidInfo(e.message));
    });

    this.post('#/create', function (ctx) {
        let { name, comment } = ctx.params;
        createTeam(name, comment);
        ctx.redirect('#/home');
    })

    this.post(`#/edit/:${(this.getLocation()).split(':')[1]}`, function (ctx) {
        let { name, comment } = ctx.params;
        let id = ctx.path.split(':')[1];
        findTeamKey(id)
            .then((key) => {
                let patchInfo = {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, comment })
                }

                fetch(`<URL_HERE>`, patchInfo)
                    .then(() => ctx.redirect('#/home'));
            });
    });
});

function loadHeaderAndFooter(ctx) {
    return ctx.loadPartials({
        'header': './templates/common/header.hbs',
        'footer': './templates/common/footer.hbs'
    });
}

function invalidInfo(msg) {
    let errorBox = document.getElementById('errorBox');
    errorBox.textContent = msg;
    errorBox.style.display = 'block';

    setTimeout(() => errorBox.style.display = 'none', 3000);
}

function validInfo(msg) {
    let infoBox = document.getElementById('infoBox');
    infoBox.textContent = msg;
    infoBox.style.display = 'block';

    setTimeout(() => infoBox.style.display = 'none', 3000);
}

function getUserInfo(ctx) {
    let userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
        let { email } = JSON.parse(userInfo);
        let username = email.split('@')[0];
        ctx.loggedIn = true;
        ctx.username = username.toUpperCase();
    }
}

function getUserInfoForCatalog(ctx) {
    let userInfo = localStorage.getItem('userInfo');
    let teams = localStorage.getItem('teams');

    if (userInfo && teams) {
        let { email } = JSON.parse(userInfo);
        let username = email.split('@')[0].toUpperCase();
        let team = JSON.parse(teams).find(t => t.members.includes(username));

        if (!team) {
            ctx.hasNoTeam = true;
        } else {
            ctx.hasNoTeam = false;
        }

    }
}

function getInfoForDetails(ctx) {
    let userInfo = localStorage.getItem('userInfo');
    let teams = localStorage.getItem('teams');

    if (userInfo && teams) {
        let { email } = JSON.parse(userInfo);
        let username = email.split('@')[0].toUpperCase();
        let currentId = ctx.path.split(':')[1];
        let currentTeam = JSON.parse(teams).find(t => t._id === currentId);

        if (currentTeam.members.includes(username)) {
            ctx.isOnTeam = true;
        } else {
            ctx.isOnTeam = false;
        }

        if (currentTeam.author === username) {
            ctx.isAuthor = true;
            ctx.teamId = currentId;
        } else {
            ctx.isAuthor = false;
        }
    }
}

function getTeamInfo(ctx) {
    let teams = localStorage.getItem('teams');
    let teamId = ctx.path.split(':')[1];

    let team = JSON.parse(teams).find(t => t._id === teamId);

    let teamMembers = team.members.map(m => {
        let username = m;
        return { username };
    });

    ctx.name = team.name;
    ctx.members = teamMembers;
    if (team.comment) {
        ctx.comment = team.comment;
    }
}

function getInfoForHome(ctx) {
    let teams = localStorage.getItem('teams');
    let userInfo = localStorage.getItem('userInfo');

    if (userInfo && teams) {
        let { email } = JSON.parse(userInfo);
        let username = email.split('@')[0].toUpperCase();
        let team = JSON.parse(teams).find(t => t.members.includes(username));

        if (!team) {
            ctx.hasTeam = false;
        } else {
            ctx.hasTeam = true;
            ctx.teamId = team._id;
        }
    }
}

async function getTeams() {
    let data = await fetch(`<URL_HERE>`);
    let response = await data.json();

    let teams = [];
    Object.keys(response).forEach(key => {
        teams.push(response[key]);
    });
    localStorage.setItem('teams', JSON.stringify(teams));
};

async function findTeamKey(id) {
    let data = await fetch(`<URL_HERE>`);
    let res = await data.json();
    let searchedKey = Object.keys(res).find(k => res[k]._id === id);
    return searchedKey;
}

function createTeam(name, comment) {
    let userInfo = localStorage.getItem('userInfo');
    let { email } = JSON.parse(userInfo);
    let username = email.split('@')[0].toUpperCase();

    let team = {
        _id: name[0],
        name,
        comment,
        author: username,
        members: [username]
    }

    let postInfo = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(team) };

    fetch(`<URL_HERE>`, postInfo);
}

(() => {
    app.run('#/home');
})();