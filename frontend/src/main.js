import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, show, hide, time, startDate, error,} from './helpers.js';
import { blankDP } from './image.js';

let state = 0;

/**
 * Calls the API from the backend server given path, method and payload
 */
const apiCall = (path, method, body, success) => {
    const options = {
        method: method,
        headers: {
            'Content-type': 'application/json',
        },
    };

    if (method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    if (localStorage.getItem('token')) {
        options.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }

    fetch('http://localhost:5005/' + path, options)
        .then((response) => {
            response.json()
                .then((data) => {
                    if (data.error) {
                        show('error-popup');
                        error("Something went wrong!", data.error);
                    } else {
                        if (success) {
                            success(data);
                        }
                    }
                });
        });
};

/**
 * Sets userId into localstorage
 */
const setUserId = (userId) => {
    localStorage.setItem('userId', userId);
}

/**
 * Sets token into localstorage
 */
const setToken = (token) => {
    localStorage.setItem('token', token);
    show('section-logged-in');
    hide('section-logged-out');
    populateFeed();
}

/**
 * Creates a new job posting based on input information
 */
const createJob = (title, image, start, description) => {
    const payload = {
        "title": title,
        "image": image,
        "start": start,
        "description": description
    }

    show('error-popup');
    error('Success!', 'Your job post has been created!')
    apiCall('job', 'POST', payload);
    populateFeed();
}

/**
 * Likes a job post 
 */
const likeJob = (postId) => {
    const payload = {
        "id": postId,
        "turnon": true
    }

    apiCall('job/like', 'PUT', payload);
}

/**
 * Leave a comment on a job post
 */
const commentJob = (postId, comment) => {
    const payload = {
        "id": postId,
        "comment": comment
    }

    apiCall('job/comment', 'POST', payload);
}

/**
 * Builds the text of the job posts
 */
const feedBuilder = (feedItem, timestampClone, startClone, titleClone, bodyClone) => {
    const timestampNode = document.createTextNode(time(feedItem.createdAt));
    const startNode = document.createTextNode(startDate(feedItem.start));
    const titleNode = document.createTextNode(feedItem.title);
    const bodyNode = document.createTextNode(feedItem.description);

    timestampClone.appendChild(timestampNode);
    startClone.appendChild(startNode);
    titleClone.appendChild(titleNode);
    bodyClone.appendChild(bodyNode);
}

/**
 * Builds the interactions component of a job post
 */
const interactionsBuilder = (feedItem, likesClone, addLikesClone, commentsClone, addCommentsClone) => {
    const likesNum = document.createTextNode(feedItem.likes.length + " like(s)");
    const addLikesWord = document.createTextNode("Like this Job!");
    const commentsNum = document.createTextNode(feedItem.comments.length + " comment(s)");
    const addCommentsWord = document.createTextNode("Add a Comment!");

    likesClone.appendChild(likesNum);
    addLikesClone.appendChild(addLikesWord);
    commentsClone.appendChild(commentsNum);
    addCommentsClone.appendChild(addCommentsWord);
}

/**
 * Edits the profile based on input information
 */
const editProfile = (email, password, name, image) => {
    const payload = {
        "email": email,
        "password": password,
        "name": name,
        "image": image
    }

    show('error-popup');
    error('Success!', 'Your profile has been updated!')
    apiCall('user', 'PUT', payload);
}

/**
 * Watch a user based on input email
 */
const watchUser = (userEmail) => {
    const payload = {
        "email": userEmail,
        "turnon": true
    }

    apiCall('user/watch', 'PUT', payload);
}

/**
 * Unwatch a user
 */
const unwatchUser = (userEmail) => {
    const payload = {
        "email": userEmail,
        "turnon": false
    }

    apiCall('user/watch', 'PUT', payload);
}

/**
 * Deletes the job posting
 */
const jobDelete = (postId) => {
    const payload = {
        "id": postId
    }
    
    show('error-popup');
    error('Success!', 'Your job post has been deleted!')
    apiCall('job', 'DELETE', payload);
}

/**
 * Populates the feed with job postings from whomst the user is watching
 */
const populateFeed = () => {
    document.getElementById('feed-items').textContent = '';

    apiCall('job/feed?start=0', 'GET', {}, (data) => {
        const feed = document.getElementById('feed-items');
        const node = document.getElementById('job-card');
        const editJob = document.getElementById('edit-job');
        const deleteJob = document.getElementById('delete-job');
        const user = document.getElementById('user');
        const timestamp = document.getElementById('timestamp');
        const image = document.getElementById('job-image');
        const title = document.getElementById('job-title');
        const start = document.getElementById('start');
        const body = document.getElementById('job-description');
        const likes = document.getElementById('likes');
        const comments = document.getElementById('comments');
        const addLikes = document.getElementById('add-likes');
        const addComments = document.getElementById('add-comments');
        const newComment = document.getElementById('new-comment');
        const list = document.getElementById('likes-list');
        const people = document.getElementById('liked-people');
        const commentsList = document.getElementById('comments-list');
        const commentedPeople = document.getElementById('commented-people');
        const editButton = document.getElementById('edit-profile');
        const watchButton = document.getElementById('watch');
        const unwatchButton = document.getElementById('unwatch');

        let newId = 1;

        for (const feedItem of data) {
            let clone = node.cloneNode(true);
            let userClone = user.cloneNode(true);
            let timestampClone = timestamp.cloneNode(true);
            let titleClone = title.cloneNode(true);
            let bodyClone = body.cloneNode(true);
            let imageClone = image.cloneNode(true);
            let startClone = start.cloneNode(true);
            let likesClone = likes.cloneNode(true);
            let addLikesClone = addLikes.cloneNode(true);
            let commentsClone = comments.cloneNode(true);
            let newCommentClone = newComment.cloneNode(true);
            let addCommentsClone = addComments.cloneNode(true);

            clone.classList.remove('hide');
            clone.style.visibility = "visible";

            if (String(feedItem.creatorId) === String(localStorage.getItem('userId'))) {
                let editJobClone = editJob.cloneNode(true);
                let deleteJobClone = deleteJob.cloneNode(true);

                editJobClone.setAttribute('id', `edit-job-${newId}`);
                clone.appendChild(editJobClone);
    
                deleteJobClone.setAttribute('id', `delete-job-${newId}`);
                clone.appendChild(deleteJobClone);

                deleteJobClone.addEventListener('click', () => {
                    jobDelete(feedItem.id);
                    populateFeed();
                });
            }

            userClone.setAttribute('id', `user-${newId}`);

            userClone.addEventListener('click', () => {
                getUser(feedItem.creatorId);
                hide('feed-page');
                show('profile-page');
                if (String(data.creatorId) === String(localStorage.getItem('userId'))) {
                    editButton.style.display = "block";
                    watchButton.style.display = "block";
                    unwatchButton.style.display = "block";    
                } else {
                    editButton.style.display = "none";
                    watchButton.style.display = "block";
                    unwatchButton.style.display = "block";                        
                }
            });

            clone.appendChild(userClone);
            clone.appendChild(timestampClone);
            clone.appendChild(titleClone);
            clone.appendChild(bodyClone);
            imageClone.setAttribute('src', feedItem.image);
            clone.appendChild(imageClone);
            clone.appendChild(startClone);
            likesClone.setAttribute('id', `likes-${newId}`);

            likesClone.addEventListener('click', () => {
                let likesId = 1;

                list.style.visibility = "visible";

                while (list.childNodes.length > 2) {
                    list.removeChild(list.lastChild);
                }

                for (const users of feedItem.likes) {
                    const peopleNode = document.createTextNode(users.userName);
                    let peopleClone = people.cloneNode(true);

                    peopleClone.setAttribute('id', `liked-people-${likesId}`);

                    peopleClone.addEventListener('click', () => {
                        getUser(users.userId);
                        hide('feed-page');
                        show('profile-page');
                    });

                    peopleClone.appendChild(peopleNode);
                    peopleClone.style.visibility = "visible";
                    list.append(peopleClone);
                    likesId+= 1;
                }
            });

            clone.appendChild(likesClone);
            addLikesClone.setAttribute('id', `add-likes-${newId}`);

            addLikesClone.addEventListener('click', () => {
                likeJob(feedItem.id);
            });

            clone.appendChild(addLikesClone);
            commentsClone.setAttribute('id', `comments-${newId}`);

            commentsClone.addEventListener('click', () => {
                let commentsId = 1;
                commentsList.style.visibility = "visible";

                while (commentsList.childNodes.length > 2) {
                    commentsList.removeChild(commentsList.lastChild);
                }

                for (const users of feedItem.comments) {
                    let commentedClone = commentedPeople.cloneNode(true);
                    const commentNode = document.createTextNode(users.userName + ": " + users.comment);

                    commentedClone.setAttribute('id', `commented-people-${commentsId}`);

                    commentedClone.addEventListener('click', () => {
                        getUser(users.userId);
                        hide('feed-page');
                        show('profile-page');
                    });

                    commentedClone.appendChild(commentNode);
                    commentedClone.style.visibility = "visible";
                    commentsList.append(commentedClone);
                }
            });

            clone.appendChild(commentsClone);
            newCommentClone.setAttribute('id', `new-comment-${newId}`);
            newCommentClone.style.visibility = "visible";
            clone.appendChild(newCommentClone);
            addCommentsClone.setAttribute('id', `add-comments-${newId}`);

            addCommentsClone.addEventListener('click', () => {
                const comment = String(newCommentClone.value);
                commentJob(feedItem.id, comment);
            });

            clone.appendChild(addCommentsClone);
            newId++;

            apiCall(`user?userId=${feedItem.creatorId}`, 'GET', {}, (data) => {
                const userNode = document.createTextNode(data.name);
                userClone.appendChild(userNode);
            });

            feedBuilder(feedItem, timestampClone, startClone, titleClone, bodyClone);
            interactionsBuilder(feedItem, likesClone, addLikesClone, commentsClone, addCommentsClone);
            feed.appendChild(clone);
        }
    });

    show('feed-page');
}

/**
 * Builds the profile page of a user given their userId
 */
const getUser = (userId) => {
    document.getElementById('view-profile').textContent = '';    
    document.getElementById('profile-jobs').textContent = '';

    apiCall(`user?userId=${userId}`, 'GET', {}, (data) => {
        const profile = document.getElementById('view-profile');
        const displayPhoto = document.getElementById('display-photo');
        const profileName = document.getElementById('profile-name');
        const userId = document.getElementById('user-id');
        const userEmail = document.getElementById('user-email');
        const watchedBy = document.getElementById('watched-by');
        const watchees = document.getElementById('watchees');
        const watcheesPerson = document.getElementById('watchees-person');
        const profileJobs = document.getElementById('profile-jobs');
        const node = document.getElementById('profile-job-card');
        const timestamp = document.getElementById('profile-timestamp');
        const image = document.getElementById('profile-job-image');
        const title = document.getElementById('profile-job-title');
        const start = document.getElementById('profile-start');
        const body = document.getElementById('profile-job-description');
        const editButton = document.getElementById('edit-profile');
        const watchButton = document.getElementById('watch');
        const unwatchButton = document.getElementById('unwatch');
        const nameNode = document.createTextNode(data.name);
        const userIdNode = document.createTextNode("User Id: " + data.id);
        const emailNode = document.createTextNode("Email: " + data.email);
        const watchedByNode = document.createTextNode("Watched By: " + data.watcheeUserIds.length);
        const watcheesWord = document.createTextNode("People Who Watch this User:");
        const profileJobsWord = document.createTextNode("Jobs Created by this User:");

        let displayPhotoClone = displayPhoto.cloneNode(true);
        let profileNameClone = profileName.cloneNode(true);
        let userIdClone = userId.cloneNode(true);
        let userEmailClone = userEmail.cloneNode(true);
        let watchedByClone = watchedBy.cloneNode(true);
        let watcheesClone = watchees.cloneNode(true);
        let profileJobsClone = profileJobs.cloneNode(true);

        if (data.image) {
            displayPhotoClone.setAttribute('src', data.image);

        } else {
            displayPhotoClone.setAttribute('src', blankDP);
        }

        profile.appendChild(displayPhotoClone);
        profile.appendChild(profileNameClone);
        profile.appendChild(userIdClone);
        profile.appendChild(userEmailClone);
        profile.appendChild(watchedByClone);
        profile.appendChild(watcheesClone);

        watchButton.addEventListener('click', () => {
            watchUser(data.email);
            document.getElementById('feed-items').textContent = '';
            populateFeed();
            hide('profile-page');
        });
                
        unwatchButton.addEventListener('click', () => {
            unwatchUser(data.email);
            document.getElementById('feed-items').textContent = '';
            populateFeed();
            hide('profile-page');
        });

        if (data.watcheeUserIds.length === 0) {
            const watchee = document.createTextNode("No one yet!");
            let watcheesPersonClone = watcheesPerson.cloneNode(true);
            profile.appendChild(watcheesPersonClone);
            watcheesPersonClone.append(watchee);
        } else {
            let personId = 1;

            for (const user of data.watcheeUserIds) {
                let watcheesPersonClone = watcheesPerson.cloneNode(true);
                watcheesPersonClone.setAttribute('id', `watchees-${personId}`);

                watcheesPersonClone.addEventListener('click', () => {
                    getUser(user);
                    show('profile-page');
                    editButton.style.display = "none";
                    watchButton.style.display = "block";
                    unwatchButton.style.display = "block";
                });

                profile.appendChild(watcheesPersonClone);
    
                apiCall(`user?userId=${user}`, 'GET', {}, (data) => {
                    const watchee = document.createTextNode(data.name);
                    watcheesPersonClone.append(watchee);
                });
            }
        }

        profile.appendChild(profileJobsClone);
        profileNameClone.appendChild(nameNode);
        userIdClone.appendChild(userIdNode);
        userEmailClone.appendChild(emailNode);
        watchedByClone.appendChild(watchedByNode);
        watcheesClone.appendChild(watcheesWord);
        profileJobsClone.appendChild(profileJobsWord);

        for (const jobItem of data.jobs) {
            let clone = node.cloneNode(true);
            let imageClone = image.cloneNode(true);
            let timestampClone = timestamp.cloneNode(true);
            let titleClone = title.cloneNode(true);
            let bodyClone = body.cloneNode(true);
            let startClone = start.cloneNode(true);

            clone.classList.remove('hide');
            clone.style.visibility = "visible";

            imageClone.setAttribute('src', jobItem.image);
            imageClone.style.display = "block";

            clone.appendChild(imageClone);
            clone.appendChild(timestampClone);
            clone.appendChild(titleClone);
            clone.appendChild(bodyClone);
            clone.appendChild(startClone);

            feedBuilder(jobItem, timestampClone, startClone, titleClone, bodyClone);
            profile.appendChild(clone);
        }
    });
}

document.getElementById('close-likes').addEventListener('click', () => {
    let list = document.getElementById('likes-list');
    list.style.visibility = "hidden";

    while (list.childNodes.length > 2) {
        list.removeChild(list.lastChild);
    };
});

document.getElementById('close-comments').addEventListener('click', () => {
    let list = document.getElementById('comments-list');
    list.style.visibility = "hidden";

    while (list.childNodes.length > 2) {
        list.removeChild(list.lastChild);
    };
});

document.getElementById('register-button').addEventListener('click', () => {
    const payload = {
        email: document.getElementById('register-email').value,
        name: document.getElementById('register-name').value,
        password: document.getElementById('register-password').value
    }

    if (document.getElementById('register-password').value !== document.getElementById('confirm-password').value) {
        show('error-popup');
        error("Invalid Password", "Passwords do not match!");
    } else {
        apiCall('auth/register', 'POST', payload, (data) => {
            setToken(data.token);
            setUserId(data.userId);
        });    
    }
});

document.getElementById('close-button').addEventListener('click', () => {
    hide('error-popup');
});

document.getElementById('login-button').addEventListener('click', () => {
    const payload = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
    }

    apiCall('auth/login', 'POST', payload, (data) => {
        setToken(data.token);
        setUserId(data.userId);
    });
});

document.getElementById('nav-register').addEventListener('click', () => {
    show('page-register');
    hide('page-login');
});

document.getElementById('nav-login').addEventListener('click', () => {
    show('page-login');
    hide('page-register');
});

document.getElementById('logout').addEventListener('click', () => {
    show('section-logged-out');
    hide('section-logged-in');
    hide('profile-page');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
});

if (localStorage.getItem('token')) {
    show('section-logged-in');
    hide('section-logged-out');
    populateFeed();
}

document.getElementById('create-job').addEventListener('click', () => {
    show('create-job-form');
    hide('feed-page');
});

document.getElementById('confirm-job').addEventListener('click', () => {
    const title = document.getElementById('add-title').value;
    const image = fileToDataUrl(document.getElementById('add-image').files[0]);
    const start = document.getElementById('add-start').value;
    const description = document.getElementById('add-description').value;

    image.then((data) => {
        createJob(title, data, start, description);
    });

    hide('create-job-form');
});

document.getElementById('nav-job-back').addEventListener('click', () => {
    hide('create-job-form');
    show('feed-page');
});

document.getElementById('my-feed').addEventListener('click', () => {
    show('feed-page');
    hide('profile-page');
});

document.getElementById('my-profile').addEventListener('click', () => {
    const editButton = document.getElementById('edit-profile');
    const watchButton = document.getElementById('watch');
    const unwatchButton = document.getElementById('unwatch');
    const userId = localStorage.getItem('userId');    

    hide('edit-profile-form');
    hide('feed-page');
    show('profile-page');

    editButton.style.display = "block";
    watchButton.style.display = "none";
    unwatchButton.style.display = "none";    

    getUser(userId);
});

document.getElementById('edit-profile').addEventListener('click', () => {
    hide('profile-page');
    show('edit-profile-form');
});

document.getElementById('nav-back').addEventListener('click', () => {
    hide('edit-profile-form');
    const userId = localStorage.getItem('userId');    
    show('profile-page');
    getUser(userId);
});

document.getElementById('edit-button').addEventListener('click', () => {
    const email = document.getElementById('edit-email').value;
    const password = document.getElementById('edit-password').value;
    const name = document.getElementById('edit-name').value;
    const image = fileToDataUrl(document.getElementById('edit-image').files[0]);

    image.then((data) => {
        editProfile(email, password, name, data);
    });
});

document.getElementById('watch-user').addEventListener('click', () => {
    show('watch-popup');
});

document.getElementById('watch-close-button').addEventListener('click', () => {
    hide('watch-popup');
});

document.getElementById('watch-submit-button').addEventListener('click', () => {
    const email = document.getElementById('watchee-email').value;
    hide('watch-popup');
    watchUser(email);
    populateFeed();
});

document.getElementById('night-mode').addEventListener('click', () => {
    if (state === 0) {
        document.body.style.background = 'beige';
        state = 1;
    } else {
        document.body.style.background = 'white';
        state = 0;
    }
});
