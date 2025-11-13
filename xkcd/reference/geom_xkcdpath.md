# GeomXkcdPath: fuzzy path/circle geom (XKCD style)

A ggplot2 geom that draws jittered, smoothed paths or fuzzy circles. It
expects aesthetics like \`x\`, \`y\`, and either \`xend\`/\`yend\` (for
segments) or \`diameter\` (for circles). Additional aesthetics (colour,
alpha, linewidth, linetype) are respected.

## Usage

``` r
geom_xkcdpath(
  mapping = NULL,
  data = NULL,
  stat = "identity",
  position = "identity",
  ...,
  xjitteramount = 0.01,
  yjitteramount = 0.01,
  mask = TRUE,
  show.legend = NA,
  inherit.aes = TRUE
)
```

## Arguments

- mapping:

  Aesthetic mapping.

- data:

  Data frame.

- stat:

  The statistical transformation to use on the data for this layer.

- position:

  Position adjustment.

- ...:

  Other arguments passed on to layer().

- xjitteramount:

  Horizontal jitter amount for segments.

- yjitteramount:

  Vertical jitter amount for segments.

- mask:

  Logical; if TRUE draws a thicker white mask path under the main path.

- show.legend:

  Show legend.

- inherit.aes:

  Whether to inherit aesthetics from the plot.
