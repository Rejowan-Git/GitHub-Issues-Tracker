# GitHub-Issues-Tracker
Answer to the Questions

## 1️⃣ What is the difference between var, let, and const?

**var** is the old way of declaring variables in JavaScript. It is function-scoped and can be re-declared and updated. Because of this, it may sometimes cause unexpected behavior.

**let** is block-scoped, meaning it only works inside the block where it is declared (like inside a loop or if statement). It can be updated but cannot be declared again in the same scope.

**const** is also block-scoped like let, but its value cannot be reassigned after declaration. It is used for values that should not change.

---

## 2️⃣ What is the spread operator (...)?

The **spread operator (...)** is used to expand elements of an array or object into another array or object.

Example:

```javascript
const arr1 = [1,2,3]
const arr2 = [...arr1,4,5]
```

Here the spread operator copies the elements of `arr1` into a new array.

---

## 3️⃣ What is the difference between map(), filter(), and forEach()?

**map()** → Creates a new array by transforming each element.

**filter()** → Creates a new array containing elements that match a condition.

**forEach()** → Loops through each element but does not return a new array. It is mainly used to perform an action.

---

## 4️⃣ What is an arrow function?

An **arrow function** is a shorter way to write functions in JavaScript.

Example:

```javascript
const add = (a,b) => a + b
```

It makes the code shorter and easier to read.

---

## 5️⃣ What are template literals?

Template literals are strings written using **backticks (` `)** that allow variables to be inserted using `${}`.

Example:

```javascript
const name = "John"
const text = `Hello ${name}`
```

---

# GitHub Issues Tracker
## 🌐 Live Website

- 🔗 Netlify Live Site: https://github-issues-tracker-ph-assignment.netlify.app/
- 🔗 GitHub Pages Live Site: https://rejowan-git.github.io/GitHub-Issues-Tracker/

This project is a simple web application that allows users to view and manage GitHub-style issues. Users can log in using demo credentials, view issues from an API, filter them by status (All, Open, Closed), search issues, and click on a card to see detailed information in a popup modal.

### Technologies Used

HTML
CSS
JavaScript (Vanilla)

### Demo Credentials

Username: admin
Password: admin123

### API Endpoints

All Issues
https://phi-lab-server.vercel.app/api/v1/lab/issues

Single Issue
https://phi-lab-server.vercel.app/api/v1/lab/issue/{id}

Search Issue
https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q={searchText}

