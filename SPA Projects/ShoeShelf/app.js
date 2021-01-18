const url = `https://jsapps-217aa.firebaseio.com/shoes`;

const app = Sammy('#root', function () {
    this.use('Handlebars', 'hbs');

    //GET
    this.get('#/home', function (ctx) {
        getUserInfo(ctx);

        getShoes()
            .then((shoes) => {
                if (shoes) {
                    ctx.hasShoes = true;
                    ctx.shoes = shoes;
                } else {
                    ctx.hasShoes = false;
                }
            })
            .then(() => {
                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs',
                    'shoe': './templates/shoe.hbs'
                })
                    .then(function () {
                        this.partial('./templates/home.hbs')
                    })
            })
            .catch(/* (e) => errorHandler(e.message) */);
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
                /* successHandler('Succesful logout!'); */
                ctx.redirect('#/login');
            })
            .catch(/* (e) => errorHandler(e.message) */);
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
        getShoe(id)
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
            .catch(/* (e) => errorHandler(e) */);
    });

    this.get('#/buy/:id', function (ctx) {
        let { id } = ctx.params;
        let { email } = JSON.parse(localStorage.getItem('userInfo'));

        getShoe(id)
            .then((data) => {
                let { buyers } = data;

                if (!buyers) {
                    buyers = [];
                }
                buyers.push(email);

                let patchInfo = {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ buyers })
                }

                fetch(`${url}/${id}.json`, patchInfo)
                    .then(function () {
                        ctx.redirect(`#/details/${id}`);
                    })
            })
    });

    this.get('#/edit/:id', function (ctx) {
        let { id } = ctx.params;

        getShoe(id)
            .then((data) => {
                getUserInfo(ctx);
                let { name, description, imageUrl, price, brand } = data;
                ctx.name = name;
                ctx.price = price;
                ctx.description = description;
                ctx.imageUrl = imageUrl;
                ctx.brand = brand;
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
            .catch(() => ctx.redirect('/register'));
    });

    this.post('#/login', function (ctx) {
        let { email, password } = ctx.params;

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((data) => {
                let { user: { email } } = data;
                localStorage.setItem('userInfo', JSON.stringify({ email }));
                /* successHandler('Logged in succesfully!'); */
                ctx.redirect('#/home')
            })
            .catch(/* (e) => errorHandler(e.message) */);
    });

    this.post('#/create', function (ctx) {
        let { name, description, imageUrl, price, brand } = ctx.params;
        let { email } = JSON.parse(localStorage.getItem('userInfo'));
        if (name == '' || description == '' || imageUrl == '' || price == '' || brand == '') {
            /* errorHandler('Invalid inputs!'); */
            return;
        }

        let shoe = {
            name,
            description,
            imageUrl,
            price,
            creator: email,
            brand,
            buyers: []
        }

        let postInfo = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shoe)
        }

        fetch(`${url}/.json`, postInfo)
            .then(() => {
                /* successHandler('Created succesfully'); */
                ctx.redirect('#/home');
            })
            .catch((e) => errorHandler(e.message));
    });


    this.post('#/edit/:id', function (ctx) {
        let { id, name, description, imageUrl, price, brand } = ctx.params;

        let patchInfo = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, imageUrl, price, brand })
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
    let { name, imageUrl, description, price, creator, buyers } = data;
    ctx.name = name;
    ctx.imageUrl = imageUrl;
    ctx.description = description;
    ctx.price = price;
    ctx.key = id;

    if (email === creator) {
        ctx.isCreator = true;
    } else {
        ctx.isCreator = false;

        if(buyers) {
            if(buyers.includes(email)) {
                ctx.isBought = true;
            }
        } else {
            ctx.isBought = false;
        }
    }
}

async function getShoes() {
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

async function getShoe(id) {
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