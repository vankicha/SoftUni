const url = `<URL_HERE>`;

const app = Sammy('#root', function () {
    this.use('Handlebars', 'hbs');

    //GET
    this.get('#/home', function (ctx) {
        getUserInfo(ctx);

        getAll()
            .then((result) => {
                if (result) {
                    if (result.some(x => x.category === 'JavaScript')) {
                        ctx.hasJS = true;
                        ctx.js = result.filter(x => x.category === 'JavaScript').sort((a, b) => b.title.localeCompare(a.title));
                    } else {
                        ctx.hasJS = false;
                    }

                    if (result.some(x => x.category === 'C#')) {
                        ctx.hasCSharp = true;
                        ctx.csharp = result.filter(x => x.category === 'C#').sort((a, b) => b.title.localeCompare(a.title));
                    } else {
                        ctx.hasCSharp = false;
                    }

                    if (result.some(x => x.category === 'Java')) {
                        ctx.hasJava = true;
                        ctx.java = result.filter(x => x.category === 'Java').sort((a, b) => b.title.localeCompare(a.title));
                    } else {
                        ctx.hasJava = false;
                    }

                    if (result.some(x => x.category === 'Python')) {
                        ctx.hasPython = true;
                        ctx.python = result.filter(x => x.category === 'Python').sort((a, b) => b.title.localeCompare(a.title));
                    } else {
                        ctx.hasPython = false;
                    }
                }

            })
            .then(() => {

                this.loadPartials({
                    'header': './templates/header.hbs', // header
                    'footer': './templates/footer.hbs',
                    'article': './templates/article.hbs'
                })
                    .then(function () {
                        this.partial('./templates/home.hbs')
                    })
            })
            .catch(/* (e) => successHandler(e.message) */);
    });

    this.get('#/register', function () {
        this.loadPartials({
            'header': './templates/header.hbs', //header
            'footer': './templates/footer.hbs'
        })
            .then(function () {
                this.partial('./templates/registerForm.hbs')
            })
    });

    this.get('#/login', function () {
        this.loadPartials({
            'header': './templates/header.hbs', //header
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
                /* successHandler('Succesful logout!'); */
                ctx.redirect('#/login');
            })
            .catch((e) => errorHandler(e.message));
    });

    this.get('#/create', function (ctx) {
        getUserInfo(ctx);

        this.loadPartials({
            'header': './templates/header.hbs', //header
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
                    'header': './templates/header.hbs', // header
                    'footer': './templates/footer.hbs'
                })
                    .then(function () {
                        this.partial('./templates/details.hbs')
                    })
            })
            .catch((e) => console.log(e));
    });

    this.get('#//:id', function (ctx) { //like or comment
        let { id } = ctx.params;
        let { email } = JSON.parse(localStorage.getItem('userInfo'));

        getOne(id)
            .then((data) => {
                let { } = data; //take array

                /* if (!) {
                     = [];
                }
                .push(email); */

                let patchInfo = {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}) //patch array
                }

                fetch(`${url}/${id}.json`, patchInfo)
                    .then(function () {
                        ctx.redirect('#/home');
                    })
            })
    });

    this.get('#/edit/:id', function (ctx) {
        let { id } = ctx.params;

        getOne(id)
            .then((data) => {
                getUserInfo(ctx);
                let { title, category, content } = data; // destruct data for ctx
                ctx.title = title;
                ctx.category = category;
                ctx.content = content;
                ctx.key = id;

                this.loadPartials({
                    'header': './templates/header.hbs', //header
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
                /* successHandler('Deleted succesfully'); */
                ctx.redirect('#/home');
            })
            .catch(/* (e) => errorHandler(e.message) */);
    });


    //POST
    this.post('#/register', function (ctx) {
        let { email, password, repeatPassword } = ctx.params;

        if (email === '' || (password === '' || password.length < 6) || repeatPassword === '') {
            /* errorHandler('Your input fields should not be empty!'); */
            ctx.redirect('#/register');
            return;
        }

        if (password !== repeatPassword) {
            /* errorHandler(`Your passwords don't match!`); */
            return;
        }

        firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                /* successHandler('Succesful registration!'); */
                ctx.redirect('#/home')
            })
            .catch((e) => errorHandler(e.message));
    });

    this.post('#/login', function (ctx) {
        let { email, password } = ctx.params;

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((data) => {
                console.log(data);
                let { user: { email, uid } } = data;
                localStorage.setItem('userInfo', JSON.stringify({ email, uid }));
                /*  successHandler('Logged in succesfully!'); */
                ctx.redirect('#/home')
            })
            .catch(/* (e) => errorHandler(e.message) */);
    });

    this.post('#/create', function (ctx) {
        let { title, category, content } = ctx.params; // destruct input fiels
        let { email } = JSON.parse(localStorage.getItem('userInfo'));
        if (title == '' || category == '' || content == '') { // check for invalid input field
            /* errorHandler('Invalid inputs!'); */
            return;
        }

        let createdObject = { //create object 
            title,
            category,
            content,
            creator: email
        }

        let postInfo = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createdObject)
        }

        fetch(`${url}/.json`, postInfo)
            .then(() => {
                /* successHandler('Created succesfully'); */
                ctx.redirect('#/home');
            })
            .catch(/* (e) => errorHandler(e.message) */);
    });


    this.post('#/edit/:id', function (ctx) {
        let { title, content, category, id } = ctx.params; //destruct input fields

        let patchInfo = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, category }) // patch input fields
        }

        fetch(`${url}/${id}.json`, patchInfo)
            .then(() => {
                /* successHandler('Edited succesfully'); */
                ctx.redirect(`#/details/${id}`);
            })
            .catch(/* (e) => errorHandler(e.message) */);
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
    let { title, category, content, creator } = data; // destruct one
    ctx.title = title;
    ctx.category = category;
    ctx.content = content;
    ctx.key = id;

    if (email === creator) {
        ctx.isCreator = true;
    } else {
        ctx.isCreator = false;

        //fill ctx
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

/* function errorHandler(msg) {
    let errorBox = document.getElementById('errorBox');

    errorBox.textContent = msg;
    errorBox.parentElement.style.display = 'block';

    setTimeout(() => errorBox.parentElement.style.display = 'none', 1000);
}

function successHandler(msg) {
    let validBox = document.getElementById('successBox');

    validBox.textContent = msg;
    validBox.parentElement.style.display = 'block';

    setTimeout(() => validBox.parentElement.style.display = 'none', 1000);
} */

(() => {
    app.run('#/home');
})();