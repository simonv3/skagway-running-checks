# skagway-running-checks

Parsing & Visualizing

If you have a CheckRun file, you can parse it like so:

```
node process-checks.js <name-of-file>.pdf
```

It'll get output in the `check-runs` folder according to the date it was run.

## Seeing output

TODO

## Seeing site locally

You'll need git, node, and jekyll.

Clone the site locally

```
git clone git@github.com:simonv3/skagway-running-checks.git
```

Move to the new directory:
```
cd skagway-running-checks
```

Then run jekyll:
```
jekyll serve
```
