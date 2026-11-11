## Introduction to Web Technologies — Endterm Project

Weeks 6–10: JavaScript and jQuery · The same project — now it actually works

## Step 0. The same project

We keep working on the project you have been building since Assignment 1. You do not start a new project and you do not create a new repository — same team, same organization, same theme, same pages. At the midterm you built the stage and the props; the endterm is where everything comes to life. There is no new topic: the endterm is graded on whether the project works, not on new features.

## What must change since the midterm

Everything you prepared at the midterm has to work now. Every button does something, every form answers the visitor, every empty container you left is filled by your code, and every state class you wrote — hidden, active, error, success — is actually switched on and off by the program. Walk your own site as a visitor: if you click something and nothing happens, that is a dead element, and each one costs 5 points.

## Logic first — not a checklist

Everything you add must belong to the project. Do not scatter JavaScript and jQuery around the site just to tick off the requirements of this document — a counter nobody needs, a colour that changes for no reason, an effect on something no visitor would click. Such a block scores nothing even when the method in it is correct. Every feature must answer a question a real visitor of your organization would actually have. If a requirement does not fit your project at first sight, find the place where it does fit instead of inventing a fake block for it. And the logic must finish, exactly as at the midterm: whatever the visitor can start, they can also complete and see the result of. A filter that filters but shows no result, an order that is collected but never totalled, a booking form that validates but never confirms — these are unfinished, and unfinished logic is the single biggest loss of points in this project.

## What counts as new work

The endterm is not a second submission of what you have already shown me. Work that was already defended in a previous assignment counts only if you have extended it with new functionality — the same validation, the same effect or the same list handed in again scores nothing. Say in the README what you added to each feature since it was last defended. This version of the project is also the one you present as your final work, so finish it as a whole, not as another weekly task.

## The freeze still holds

You do not add HTML elements by hand and you do not write new CSS rules by hand. New content is created in code; appearance changes only by switching classes that already exist in your stylesheet. I will compare your repository against the midterm tag, so hand-written markup or styles added after it will be found. You may still add an id or a class to an existing element when your code needs a hook.

## Plain JavaScript — weeks 6 to 8

Part of your site must run on plain JavaScript, and it must show what those weeks covered. Keep the real data of your project in arrays and objects at the top of your file — your dishes, services, prices, team members or opening hours — and build the page from them with a loop, so that markup for those items exists nowhere in your HTML. Write your own functions with parameters and a return value, and call each of them from more than one place. Use conditions where the project needs them: a price that changes, a label such as "closed today", a discount above a certain amount. At least one number must be calculated rather than written by hand — a total, a count, a sum.

## Events and interaction

Attach every handler in code; no onclick attributes in the markup. Use at least three different event types, and at least one delegated handler bound to a parent so it also works for the elements your own code creates later. Use the event object where it belongs — preventDefault on a form, and the clicked element itself to find out what the visitor acted on.

## Form validation

Your main form must be fully validated in code. On submit, prevent the default, trim the values, check every field, show the error next to the field that is wrong rather than one message for the whole form, clear the error as soon as the visitor fixes it, and show a confirmation only when every check passes. Check the shape of the e-mail and the phone. A form that always says "thank you" is not validation and scores zero for this part.

## jQuery — weeks 9 and 10

Another part of your site must run on jQuery, linked from a CDN and wrapped in \$(function () { ... }). Show selectors of different kinds, traversal instead of extra ids — .closest(), .find(), .siblings(), \$(this) — at least one chain of three or more methods, and at least two effects that belong to something the visitor does, such as an FAQ answer, a filter panel or a confirmation message. Keep the two apart: a feature is either plain JavaScript or jQuery, never both, and keep them in separate files. You must be able to explain either one at the defense, so do not let one person write all the jQuery and another all the JavaScript.

## Scope — one visitor, one site

Everything on your site must be something a single visitor can complete alone from their own screen. No staff accounts, no admin panels, no approval chains: there is no server and no database, so those paths cannot be finished. Interaction runs between the visitor and your pages — choosing, filling in, submitting, getting an answer back.

## The technical floor

The browser console shows no errors on any page. No dead buttons, no dead links, no empty containers left unfilled. Nothing overflows sideways at phone width. The pages still pass the W3C validator. Nothing that already worked may break: the Bootstrap layout, the


responsive behaviour and the navigation from the earlier assignments must still work exactly as before — adding scripts is the usual way projects lose them. Handle the empty case too: if a list has nothing in it, or a filter finds nothing, the page says so instead of showing a blank area. All content is still real — real prices, hours, address, phone and your own photographs. Code you copied from a tutorial and never adapted to your project counts as placeholder content, and leftover debugging lines are not finished work.

## Quality pass before you submit

At least two days before the deadline, each student opens the features written by someone else in the team — or, working alone, opens the site on another device — clicks everything, submits every form with empty and with wrong values, and writes down what breaks. Fix it. This is the step that separates a project that works from one that works only on the author's screen.

## Freeze and submit

When everything works, commit and tag it in Git with the name endterm. The same repository: your JavaScript files, your jQuery file, an updated AI log and a README listing which feature is plain JavaScript and which is jQuery, and who wrote what. There is no written report and nothing to record — everything is shown live at the defense. Everyone commits from their own account, at least four commits across three different days, six if you work alone.

## Defense

You open the site in front of me and show it working. I will point at a line of your code and ask what it does, ask why a delegated handler catches elements that did not exist yet, ask what would break if a particular line were removed, and give you small live tasks — add a field to the validation, change what a loop builds, make a button do one more thing, or rewrite a short piece of jQuery in plain JavaScript. I may also give a practical task on any topic from the whole course, plus a few oral questions from the lectures. You may look at the official documentation and w3schools.com, but not ask another person or an AI. Your grade is the project score multiplied by how well you explain your own work; if you cannot explain it, the score is zero. Work that is submitted but not defended is not evaluated, even if it was uploaded before the deadline.

## Grading (100 points)

The logic of the whole site finishes, everything prepared at the midterm now works, nothing dead 20 · plain JavaScript: data in arrays and objects, loops, functions, conditions, a calculated value 20 · events and delegation 14 · form validation 16 · jQuery: selectors, traversal, chaining, effects 18 · code quality: the two parts kept separate, clear naming, no console errors 12. Penalties: 15 for a feature added only to satisfy this document and serving no purpose in the project, 15 for resubmitting work already defended without new functionality, 10 for new hand-written HTML or CSS after the midterm tag, 10 for breaking something that worked in an earlier assignment, 10 for a flow one visitor cannot finish alone, 10 for copied code not adapted to your project, 5 per dead button or link, 5 per console error, 5 per onclick attribute in the markup, 5 for mixing plain JavaScript and jQuery inside one feature.

## AI policy

Unchanged: you may ask AI to explain concepts and you may read the official documentation. You may not have AI write your code, and every question goes in the AI log. The defense settles it — a line you cannot explain scores nothing, however well it runs.
