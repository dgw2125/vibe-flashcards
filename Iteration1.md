2/21/26

Note: A couple of weeks ago, I shipped improvements to the app. I improved the UI aesthetics and functionality. Additional improvements are documented in commit history on Github.

ITERATION 1
I want to write own what exactly I want to ship in this next iteration. Because I did not document my previous set of improvements like this explicitly, I'm calling document "Iteration 1."

Theme: Mastery UX
Default: "Stars"
As the user works through a deck, and when a user "stars" cards, count how many "starred" cards there are and surface this informaiton to users. 

At the end of a deck, users should be offered features to "Review again" or "Review starred cards." This is an intuitive and approachable way to use repetition or tailored repetition to augment learning.

Advanced Feature: Mastery Indicator
After reviewing a card, users can indicate their perceived level of mastery: "easy", "medium", and "hard". Providing this rating is mandatory. It is committed to memory once a user selects a level of mastery option. Users can change their rating.

At the end of a deck, display the breakdown the levels of mastery across the deck. How many cards were "easy"? How many of them were "medium"? How many of them were "hard"?

If users had previously reviewed the cards, then display how the states of mastery changed from their last review to the most recent review. For example, the number of "hard" cards decreased from 5 to 3, the number of "medium" cards  decreased from 5 to 3, and the number of "easy" cards increased from 0 to 4. 

Also show the of previously "unreviewed" to cards 

At the end of the deck or at tool bar on the right-hand side of the screen, there is also a feature to review just "hard" cards. 


High-Level Technical Changes:
* Introduce stable card identifiers (instead of relying on array index), so mastery state remains consistent even if cards are shuffled.
* Persist mastery state in localStorage, using a structured object keyed by pack.
* Load mastery state on pack initialization, so stars and ratings render correctly after refresh.
* Update and save mastery state on user interaction (star toggle or rating click).
* Refactor UI rendering logic to derive star/rating state from stored data rather than in-memory variables.
* Add filtering logic (e.g., “Starred only” or “Hard only”) that queries stored mastery metadata instead of transient session state.