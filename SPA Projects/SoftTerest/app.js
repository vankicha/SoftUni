const url = `<URL_HERE>`;

const app = Sammy('#root', function () {
    this.use('Handlebars', 'hbs');

    this.get('#/user', function (ctx) {
        getUserInfo(ctx);

        getAll()
            .then((result) => {
                let { email } = JSON.parse(localStorage.getItem('userInfo'));

                if (result) {
                    let myIdeas = result.filter(x => x.creator === email);

                    if (myIdeas) {
                        ctx.hasIdeas = true;
                        ctx.ideasCount = myIdeas.length;
                        ctx.ideas = myIdeas;
                    }
                } else {
                    ctx.ideasCount = 0;
                }
            })
            .then(() => {
                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs',
                    'userIdea': './templates/userIdea.hbs'
                })
                    .then(function () {
                        this.partial('./templates/user.hbs');
                    })
            })

    })

    this.get('#/dashboard', function (ctx) {
        getUserInfo(ctx);
        getAll()
            .then((result) => {
                if (result) {
                    ctx.hasIdeas = true;
                    ctx.ideas = result.sort((a, b) => b.likes - a.likes);
                }
            })
            .then(() => {
                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs',
                    'idea': './templates/idea.hbs'
                })
                    .then(function () {
                        this.partial('./templates/home.hbs');
                    })
            })
            .catch((e) => errorHandler(e.message));
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
                successHandler('Logout successful.');
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
                    'footer': './templates/footer.hbs',
                    'comment': './templates/comment.hbs'
                })
                    .then(function () {
                        this.partial('./templates/details.hbs')
                    })
            })
            .catch((e) => console.log(e));
    });

    this.get('#/like/:id', function (ctx) {
        let { id } = ctx.params;

        getOne(id)
            .then((data) => {
                let { likes } = data;
                likes++;

                let patchInfo = {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ likes })
                }

                fetch(`${url}/${id}.json`, patchInfo)
                    .then(function () {
                        ctx.redirect(`#/details/${id}`);
                    })
            })
    });

    this.get('#/comment/:id', function (ctx) {
        let userInfo = localStorage.getItem('userInfo');
        let { email } = JSON.parse(userInfo);
        let { id } = ctx.params;
        let comment = document.getElementById('newComment').value;
        getOne(id)
            .then((data) => {
                let { comments } = data;

                if (!comments) {
                    comments = [];
                }
                comments.push({ email, comment });

                let patchInfo = {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comments })
                }

                fetch(`${url}/${id}.json`, patchInfo)
                    .then(function () {
                        ctx.redirect(`#/details/${id}`);
                    })
            })
    });

    this.get('#/delete/:id', function (ctx) {
        let { id } = ctx.params;

        fetch(`${url}/${id}.json`, { method: 'DELETE' })
            .then(() => {
                successHandler('Deleted succesfully');
                ctx.redirect('#/dashboard');
            })
            .catch((e) => errorHandler(e.message));
    });

    this.post('#/register', function (ctx) {
        let { email, password, repeatPassword } = ctx.params;

        if (email.length < 3) {
            errorHandler('Email length should be longer!');
            ctx.redirect('#/register');
            return;
        }

        if (password.length < 3) {
            errorHandler('Password length should be longer!');
            ctx.redirect('#/register');
            return;
        }

        if (password !== repeatPassword) {
            errorHandler(`Your passwords don't match!`);
            ctx.redirect('#/register');
            return;
        }

        firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                successHandler('User registration successful.');
                ctx.redirect('#/dashboard');
            })
            .catch((e) => errorHandler(e.message));
    });

    this.post('#/login', function (ctx) {
        let { email, password } = ctx.params;

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((data) => {
                let { user: { email } } = data;
                localStorage.setItem('userInfo', JSON.stringify({ email }));
                successHandler('Login successful.');
                ctx.redirect('#/dashboard')
            })
            .catch((e) => {
                errorHandler(e.message)
                ctx.redirect('#/login');
            });
    });

    this.post('#/create', function (ctx) {
        let { title, description, imageUrl } = ctx.params;
        let { email } = JSON.parse(localStorage.getItem('userInfo'));
        console.log(imageUrl);
        if (title.length < 6 || description.length < 10 || (!imageUrl.includes('http://')) && (!imageUrl.includes('https://'))) {
            errorHandler('Something went wrong!');
            return;
        }

        let createdObject = {
            title,
            description,
            imageUrl,
            creator: email,
            likes: 0,
        }

        let postInfo = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdObject)
        }

        fetch(`${url}/.json`, postInfo)
            .then(() => {
                successHandler('Created succesfully');
                document.getElementById('title').value = '';
                document.querySelector('textarea').value = '';
                document.getElementById('imageUrl').value = '';
            })
            .catch((e) => errorHandler('Something went wrong!'));
    });
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
    let { title, description, imageUrl, creator, likes, comments } = data;
    ctx.title = title;
    ctx.description = description;
    ctx.imageUrl = imageUrl;
    ctx.likes = likes;
    ctx.key = id;

    if (email === creator) {
        ctx.isCreator = true;
    }

    if (comments) {
        ctx.hasComments = true;
        ctx.comments = comments;
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
    errorBox.style.display = 'block';

    setTimeout(() => errorBox.style.display = 'none', 5000);
}

function successHandler(msg) {
    let validBox = document.getElementById('successBox');

    validBox.textContent = msg;
    validBox.style.display = 'block';

    validBox.addEventListener('click', function (e) {
        e.target.style.display = 'none';
    })
    setTimeout(() => validBox.style.display = 'none', 5000);
}

function hideLoadingBox() {
    let loadingBox = document.getElementById('loadingBox');
    loadingBox.style.display = 'none';
}

function startLoadingBox() {
    let loadingBox = document.getElementById('loadingBox');
    loadingBox.style.display = 'block';
}

(() => {
    app.run('#/dashboard');
})();