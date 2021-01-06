const url = `https://js-exam-ff539-default-rtdb.firebaseio.com/destinations`;

const app = Sammy('#container', function () {
    this.use('Handlebars', 'hbs');

    //GET
    this.get('#/home', function (ctx) {
        startLoadingBox();
        getUserInfo(ctx);

        getAll()
            .then((result) => {
                if (result) {
                    ctx.hasDestinations = true;
                    ctx.destinations = result;
                }
            })
            .then(() => {
                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs',
                    'commonDestination': './templates/commonDestination.hbs'
                })
                    .then(function () {
                        this.partial('./templates/home.hbs')
                        hideLoadingBox();
                    })
            })
            .catch((e) => errorHandler(e.message));
    });

    this.get('#/destinations', function (ctx) {
        startLoadingBox();
        getUserInfo(ctx);

        getAll()
            .then((result) => {
                if (result.find(x => x.creator === ctx.email)) {
                    ctx.hasDestinations = true;
                    ctx.destinations = result.filter(x => x.creator === ctx.email);
                }
            })
            .then(() => {

                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs',
                    'destination': './templates/destination.hbs'
                })
                    .then(function () {
                        this.partial('./templates/myDestinations.hbs')
                        hideLoadingBox();
                    })
            })
            .catch((e) => errorHandler(e.message));
    });

    this.get('#/register', function () {
        startLoadingBox();
        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
        })
            .then(function () {
                this.partial('./templates/registerForm.hbs')
                hideLoadingBox();
            })
    });

    this.get('#/login', function () {
        startLoadingBox();
        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
        })
            .then(function () {
                this.partial('./templates/loginForm.hbs')
                hideLoadingBox();
            })
    });

    this.get('#/logout', function (ctx) {

        firebase.auth()
            .signOut()
            .then(() => {
                localStorage.removeItem('userInfo');
                successHandler('Logout successful.')
                ctx.redirect('#/login');
            })
            .catch((e) => errorHandler(e.message));
    });

    this.get('#/create', function (ctx) {
        startLoadingBox();
        getUserInfo(ctx);

        this.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
        })
            .then(function () {
                this.partial('./templates/createForm.hbs')
                hideLoadingBox();
            })
    });

    this.get('#/details/:id', function (ctx) {
        startLoadingBox();
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
                        hideLoadingBox();
                    })
            })
            .catch((e) => errorHandler(e.message));
    });

    this.get('#/edit/:id', function (ctx) {
        startLoadingBox();
        let { id } = ctx.params;

        getOne(id)
            .then((data) => {
                getUserInfo(ctx);
                let { destination, city, imgUrl, departureDate, duration } = data;
                ctx.city = city;
                ctx.destination = destination;
                ctx.departureDate = departureDate;
                ctx.duration = duration;
                ctx.imgUrl = imgUrl;
                ctx.key = id;

                this.loadPartials({
                    'header': './templates/header.hbs',
                    'footer': './templates/footer.hbs'
                })
                    .then(function () {
                        this.partial('./templates/editForm.hbs')
                        hideLoadingBox();
                    })

            })
    });

    this.get('#/delete/:id', function (ctx) {
        let { id } = ctx.params;

        fetch(`${url}/${id}.json`, { method: 'DELETE' })
            .then(() => {
                successHandler('Destination deleted.');
                ctx.redirect('#/destinations');
            })
            .catch((e) => errorHandler(e.message));
    });


    //POST
    this.post('#/register', function (ctx) {
        let { email, password, rePassword } = ctx.params;
        let re = /[\w+\d+]@[\w+]/;
        if (!(re.test(email))) {
            errorHandler('Invalid email!');
            return;
        }

        if (password === '') {
            errorHandler('Password cannot be empty!');
            return;
        }

        if (password !== rePassword) {
            errorHandler('Both passwords should match!');
            return;
        }

        firebase.auth()
            .createUserWithEmailAndPassword(email, password)
            .then((data) => {
                let { user: { email, uid } } = data;
                localStorage.setItem('userInfo', JSON.stringify({ email, uid }));
                successHandler('User registration successful.');
                ctx.redirect('#/home');
            })
            .catch((e) => {
                errorHandler(e.message);
                ctx.redirect('#/register');
            });
    });

    this.post('#/login', function (ctx) {
        let { email, password } = ctx.params;

        let re = /[\w+\d+]@[\w+]/;
        if (!(re.test(email))) {
            errorHandler('Invalid email!');
            return;
        }

        if (password === '') {
            errorHandler('Password cannot be empty!');
            return;
        }

        firebase.auth()
            .signInWithEmailAndPassword(email, password)
            .then((data) => {
                let { user: { email } } = data;
                localStorage.setItem('userInfo', JSON.stringify({ email }));
                successHandler('Login successful.');
                ctx.redirect('#/home');
            })
            .catch((e) => {
                errorHandler(e.message);
                ctx.redirect('#/login');
            });
    });

    this.post('#/create', function (ctx) {
        let { destination, city, duration, departureDate, imgUrl } = ctx.params;
        let { email } = JSON.parse(localStorage.getItem('userInfo'));
        if (destination == '' || city == '' || duration == '' || departureDate == '' || imgUrl == '') {
            errorHandler('All input fields should be filled!');
            return;
        }

        if (Number(duration) < 1 || Number(duration) > 100) {
            errorHandler('Duration must be between 1 and 100 days!');
            return;
        }

        let createdObject = {
            destination,
            city,
            duration: Number(duration),
            departureDate,
            imgUrl,
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
            .catch((e) => errorHandler(e.message));
    });


    this.post('#/edit/:id', function (ctx) {
        let { id, destination, city, duration, departureDate, imgUrl } = ctx.params;

        if (destination == '' || city == '' || duration == '' || departureDate == '' || imgUrl == '') {
            errorHandler('All input fields should be filled!');
            return;
        }

        if (Number(duration) < 1 || Number(duration) > 100) {
            errorHandler('Duration must be between 1 and 100 days!');
            return;
        }

        let editedObject = {
            destination,
            city,
            duration: Number(duration),
            departureDate,
            imgUrl
        }

        let patchInfo = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedObject)
        }

        fetch(`${url}/${id}.json`, patchInfo)
            .then(() => {
                successHandler('Successfully edited destination.');
                ctx.redirect(`#/details/${id}`);
            })
            .catch((e) => errorHandler(e.message));
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
    let { city, destination, departureDate, duration, imgUrl, creator } = data;

    let year = departureDate.split('-')[0];
    let day = departureDate.split('-')[2];
    let monthAsNumber = departureDate.split('-')[1];
    let month;

    switch (monthAsNumber) {
        case '01': month = 'January'; break;
        case '02': month = 'February'; break;
        case '03': month = 'March'; break;
        case '04': month = 'April'; break;
        case '05': month = 'May'; break;
        case '06': month = 'June'; break;
        case '07': month = 'July'; break;
        case '08': month = 'August'; break;
        case '09': month = 'September'; break;
        case '10': month = 'October'; break;
        case '11': month = 'November'; break;
        case '12': month = 'December'; break;
    }

    let formattedDate = [];
    formattedDate.push(day); //push day
    formattedDate.push(month); //push month
    formattedDate.push(year); // push year

    ctx.city = city;
    ctx.destination = destination;
    ctx.departureDate = formattedDate.join(' ');
    ctx.duration = duration;
    ctx.imgUrl = imgUrl;
    ctx.key = id;

    if (email === creator) {
        ctx.isCreator = true;
    } else {
        ctx.isCreator = false;
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
    let errorBox = document.querySelector('div').querySelectorAll('div')[2];

    errorBox.textContent = msg;
    errorBox.style.display = 'block';

    errorBox.addEventListener('click', function (e) {
        e.target.style.display = 'none';
    });
    setTimeout(() => errorBox.style.display = 'none', 3000);
}

function successHandler(msg) {
    let validBox = document.querySelector('div').querySelectorAll('div')[1];

    validBox.textContent = msg;
    validBox.style.display = 'block';

    validBox.addEventListener('click', function (e) {
        e.target.style.display = 'none';
    });
    setTimeout(() => validBox.style.display = 'none', 3000);
}

function hideLoadingBox() {
    let loadingBox = document.querySelector('div').querySelectorAll('div')[0];
    loadingBox.style.display = 'none';
}

function startLoadingBox() {
    let loadingBox = document.querySelector('div').querySelectorAll('div')[0];
    loadingBox.style.display = 'block';
}

(() => {
    app.run('#/home');
})();