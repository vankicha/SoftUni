const url = `https://jsapps-217aa.firebaseio.com/posts`;

const app = Sammy('#root', function () {
    this.use('Handlebars', 'hbs');

    //GET
    this.get('#/home', function (ctx) {
        getUserInfo(ctx);
        getAll()
            .then((result) => {
                loadPosts(result, ctx);
            })
            .then(() => {

                this.loadPartials({
                    'header': './templates/header.hbs',
                    'createForm': './templates/createForm.hbs',
                    'post': './templates/post.hbs'
                })
                    .then(function () {
                        this.partial('./templates/home.hbs')
                    })
            })
            .catch((e) => console.log(e.message));
    });

    this.get('#/register', function () {
        this.loadPartials({
            'header': './templates/header.hbs',
        })
            .then(function () {
                this.partial('./templates/registerForm.hbs')
            })
    });

    this.get('#/login', function () {
        this.loadPartials({
            'header': './templates/header.hbs',
        })
            .then(function () {
                this.partial('./templates/loginForm.hbs')
            })
    });

    this.get('#/logout', function (ctx) {
        firebase.auth()
            .signOut()
            .then(() => {
                localStorage.removeItem('userInfo');
                ctx.redirect('#/home');
            })
            .catch((e) => errorHandler(e.message));
    });

    this.get('#/details/:id', function (ctx) {
        let { id } = ctx.params;

        getUserInfo(ctx);
        getOne(id)
            .then((data) => {
                getDetails(data, ctx, id);

                this.loadPartials({
                    'header': './templates/header.hbs'
                })
                    .then(function () {
                        this.partial('./templates/details.hbs')
                    })
            })
            .catch((e) => console.log(e));
    });


    this.get('#/edit/:id', function (ctx) {
        let { id } = ctx.params;

        getAll()
            .then((result) => {
                getOne(id)
                    .then((data) => {
                        getUserInfo(ctx);
                        let { title, content, category } = data;
                        ctx.title = title;
                        ctx.content = content;
                        ctx.category = category;
                        ctx.key = id;

                        loadPosts(result, ctx);
                        this.loadPartials({
                            'header': './templates/header.hbs',
                            'post': './templates/post.hbs'
                        })
                            .then(function () {
                                this.partial('./templates/editForm.hbs')
                            })

                    })
            })
    });

    this.get('#/delete/:id', function (ctx) {
        let { id } = ctx.params;

        fetch(`${url}/${id}.json`, { method: 'DELETE' })
            .then(() => {
                ctx.redirect('#/home');
            })
            .catch((e) => console.log(e.message));
    });


    //POST
    this.post('#/register', function (ctx) {
        let { email, password, repeatPassword } = ctx.params;

        if (email === '' || password.length < 6 || repeatPassword === '') {
            ctx.redirect('#/register');
            return;
        }

        if (password !== repeatPassword) {
            return;
        }

        firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                ctx.redirect('#/login')
            })
            .catch((e) => console.log(e.message));
    });

    this.post('#/login', function (ctx) {
        let { email, password } = ctx.params;

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((data) => {
                let { user: { email } } = data;
                localStorage.setItem('userInfo', JSON.stringify({ email }));
                ctx.redirect('#/home')
            })
            .catch((e) => console.log(e.message));
    });

    this.post('#/create-post', function (ctx) {
        let { title, content, category } = ctx.params;
        let { email } = JSON.parse(localStorage.getItem('userInfo'));
        if (title == '' || content == '' || category == '') {
            errorHandler('Invalid inputs!');
            return;
        }

        let createdObject = {
            title,
            content,
            category,
            creator: email
        }

        let postInfo = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdObject)
        }

        fetch(`${url}/.json`, postInfo)
            .then(() => {
                ctx.redirect('#/home');
            })
            .catch((e) => console.log(e.message));
    });


    this.post('#/edit/:id', function (ctx) {
        let { id, title, category, content } = ctx.params;

        let patchInfo = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, content })
        }

        fetch(`${url}/${id}.json`, patchInfo)
            .then(() => {

                ctx.redirect('#/home');
            })
            .catch((e) => console.log(e.message));
    })
});

function loadPosts(result, ctx) {
    if (result) {
        ctx.hasPosts = true;

        if (result.find(x => x.creator === ctx.email)) {
            let ownPosts = result
                .filter(x => x.creator === ctx.email)
                .map(x => {
                    return { isCreator: true, ...x }
                });
            ctx.ownPosts = ownPosts;
        }

        if (result.find(x => x.creator !== ctx.email)) {
            let otherPosts = result
                .filter(x => x.creator !== ctx.email)
                .map(x => {
                    return { isCreator: false, ...x }
                });
            ctx.otherPosts = otherPosts;
        }
    }
}

function getUserInfo(ctx) {
    let userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
        let { email } = JSON.parse(userInfo);
        ctx.isLogged = true;
        ctx.email = email;
    }
};

function getDetails(data, ctx, id) {
    let { title, content, category } = data;
    ctx.title = title;
    ctx.content = content;
    ctx.category = category;
    ctx.key = id;
}

async function getAll() {
    let response = await fetch(`${url}/.json`);
    let data = await response.json();

    if (!data) {
        return;
    }

    let result = [];
    Object.keys(data).forEach(key => {
        let obj = { key, ...data[key] };
        result.push(obj);
    });

    return result;
};

async function getOne(id) {
    let response = await fetch(`${url}/${id}.json`);
    let data = await response.json();

    return data;
}

(() => {
    app.run('#/home');
})();