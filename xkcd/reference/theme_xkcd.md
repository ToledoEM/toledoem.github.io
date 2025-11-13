# Creates an XKCD theme

This function creates an XKCD theme, applying the 'xkcd' font if
available.

## Usage

``` r
theme_xkcd()
```

## Value

A [`theme`](https://ggplot2.tidyverse.org/reference/theme.html) object.

## Note

The "xkcd" font must be installed and registered with `extrafont` for
the full effect. See the vignette
[`vignette("xkcd-intro")`](https://toledoem.github.io/xkcd/articles/xkcd-intro.md)
for installation instructions.

## Examples

``` r
if (FALSE) { # \dontrun{
# Assuming 'xkcd' font is installed and registered:
p <- ggplot(mtcars, aes(mpg, wt)) +
     geom_point() +
     theme_xkcd()
p
} # }
```
