const url = `<URL_HERE>`;

const app = Sammy('#container', function () {
    this.use('Handlebars', 'hbs');

    this.get('#/home', function (ctx) {
        getUserInfo(ctx);

        getAll()
            .then((result) => {
                if (result) {
                    ctx.hasMovies = true;
                    ctx.movies = result;
                }
            })
            .then(() => {

                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs',
                    'movie': './templates/movie.hbs'
                })
                    .then(function () {
                        this.partial('./templates/home.hbs')
                    })
            })
            .catch();
    });

    this.get('#/home-filtered', function (ctx) {
        let { searchedWord } = ctx.params;
        getUserInfo(ctx);

        getAll()
            .then((result) => {
                if (result.find(x => x.title.includes(searchedWord))) {
                    ctx.hasMovies = true;
                    ctx.movies = result.filter(x => x.title.includes(searchedWord));
                }
            })
            .then(() => {

                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs',
                    'movie': './templates/movie.hbs'
                })
                    .then(function () {
                        this.partial('./templates/home.hbs')
                    })
            })
            .catch();
    });

    this.get('#/register', function () {
        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
        })
            .then(function () {
                this.partial('./templates/registerForm.hbs')
            })
    });

    this.get('#/login', function () {
        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
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
                successHandler('Successful logout');
                ctx.redirect('#/login');
            })
            .catch((e) => errorHandler(e.message));
    });

    this.get('#/create', function (ctx) {
        getUserInfo(ctx);

        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
        })
            .then(function () {
                this.partial('./templates/createForm.hbs')
            })
    });

    this.get('#/details/:id', function (ctx) {
        let { id } = ctx.params;

        getUserInfo(ctx);
        getOne(id)
            .then((data) => {
                getDetails(data, ctx, id);

                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs'
                })
                    .then(function () {
                        this.partial('./templates/details.hbs')
                    })
            })
            .catch();
    });

    this.get('#/like/:id', function (ctx) {
        let { id } = ctx.params;
        let { email } = JSON.parse(localStorage.getItem('userInfo'));

        getOne(id)
            .then((data) => {
                let { likes } = data;

                if (!likes) {
                    likes = [];
                }
                likes.push(email);

                let patchInfo = {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ likes })
                }

                fetch(`${url}/${id}.json`, patchInfo)
                    .then(function () {
                        successHandler('Liked successfully');
                        ctx.redirect(`#/details/${id}`);
                    })
            })
    });

    this.get('#/edit/:id', function (ctx) {
        let { id } = ctx.params;

        getOne(id)
            .then((data) => {
                getUserInfo(ctx);
                let { title, description, imageUrl } = data;
                ctx.title = title;
                ctx.description = description;
                ctx.imageUrl = imageUrl;
                ctx.key = id;

                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs'
                })
                    .then(function () {
                        this.partial('./templates/editForm.hbs')
                    })

            })
    });

    this.get('#/delete/:id', function (ctx) {
        let { id } = ctx.params;

        fetch(`${url}/${id}.json`, { method: 'DELETE' })
            .then(() => {
                successHandler('Deleted successfully');
                ctx.redirect('#/home');
            })
            .catch();
    });

    this.post('#/register', function (ctx) {
        let { email, password, repeatPassword } = ctx.params;

        if (email === '') {
            errorHandler('Invalid email!');
            ctx.redirect('#/register');
            return;
        }

        if (password.length < 6) {
            errorHandler('Invalid password!');
            ctx.redirect('#/register');
            return;
        }

        if (password !== repeatPassword) {
            errorHandler('Passwords must match!');
            return;
        }

        firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then((data) => {
                let { user: { email, uid } } = data;
                localStorage.setItem('userInfo', JSON.stringify({ email, uid }));
                successHandler('Successful registration!');
                ctx.redirect('#/home')
            })
            .catch((e) => errorHandler(e.message));
    });

    this.post('#/login', function (ctx) {
        let { email, password } = ctx.params;

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((data) => {
                let { user: { email, uid } } = data;
                localStorage.setItem('userInfo', JSON.stringify({ email, uid }));
                successHandler('Login successful.');
                ctx.redirect('#/home')
            })
            .catch((e) => {
                errorHandler(e.message);
                ctx.redirect('#/login');
            });
    });

    this.post('#/create', function (ctx) {
        let { title, description, imageUrl } = ctx.params;
        let { email } = JSON.parse(localStorage.getItem('userInfo'));
        if (title == '' || description == '' || imageUrl == '') {
            errorHandler('Invalid inputs!');
            return;
        }

        let createdObject = {
            title,
            description,
            imageUrl,
            creator: email
        }

        let postInfo = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdObject)
        }

        fetch(`${url}/.json`, postInfo)
            .then(() => {
                successHandler('Created successfully!');
                ctx.redirect('#/home');
            })
            .catch();
    });


    this.post('#/edit/:id', function (ctx) {
        let { id, title, description, imageUrl } = ctx.params;

        let patchInfo = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, imageUrl })
        }

        fetch(`${url}/${id}.json`, patchInfo)
            .then(() => {
                successHandler('Eddited successfully');
                ctx.redirect(`#/details/${id}`);
            })
            .catch();
    })
});

function getUserInfo(ctx) {
    let userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
        let { email } = JSON.parse(userInfo);
        ctx.isLogged = true;
        ctx.email = email;
    }
};

function getDetails(data, ctx, id) {
    let { email } = JSON.parse(localStorage.getItem('userInfo'));
    let { title, description, imageUrl, creator, likes } = data;
    ctx.title = title;
    ctx.description = description;
    ctx.imageUrl = imageUrl;
    ctx.key = id;

    if (email === creator) {
        ctx.isCreator = true;
    } else {
        ctx.isCreator = false;

        if (likes) {
            if (likes.includes(email)) {
                ctx.isLiked = true;
                ctx.count = likes.length;
            }
        }
    }
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

function errorHandler(msg) {
    let errorBox = document.getElementById('errorBox');

    errorBox.textContent = msg;
    errorBox.parentElement.style.display = 'block';

    setTimeout(() => errorBox.parentElement.style.display = 'none', 3000);
}

function successHandler(msg) {
    let validBox = document.getElementById('successBox');

    validBox.textContent = msg;
    validBox.parentElement.style.display = 'block';

    setTimeout(() => validBox.parentElement.style.display = 'none', 3000);
}

(() => {
    app.run('#/home');
})();