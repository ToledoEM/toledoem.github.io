# PubMatrixR with Ligand Receptors

![PubMatrixR logo](https://toledoem.github.io/img/LogoPubmatrix.png)

## Introduction

WNT ligands and their receptors do not pair off neatly. A given ligand
can bind several receptors, and the literature reflects that: some
ligand-receptor combinations turn up in paper after paper, others almost
never.

This vignette counts those co-occurrences. It compares 19 WNT ligands
against 15 receptors (FZD1-10, LRP5/6, ROR1/2, RYK), which gives a 15x19
grid of PubMed counts. Bear in mind what the numbers actually measure:
how often two gene symbols appear in the same record, not whether the
paper found them to interact.

[`library`](https://rdrr.io/r/base/library.html)`(`[`PubMatrixR`](https://github.com/ToledoEM/PubMatrixR-v2)`)`` `[`library`](https://rdrr.io/r/base/library.html)`(`[`knitr`](https://yihui.org/knitr/)`)`` `[`library`](https://rdrr.io/r/base/library.html)`(`[`kableExtra`](https://haozhu233.github.io/kableExtra/)`)`` `[`library`](https://rdrr.io/r/base/library.html)`(`[`dplyr`](https://dplyr.tidyverse.org)`)`` `[`library`](https://rdrr.io/r/base/library.html)`(``pheatmap``)`` `[`library`](https://rdrr.io/r/base/library.html)`(`[`ggplot2`](https://ggplot2.tidyverse.org)`)`

`A`` ``<-`` `[`c`](https://rdrr.io/r/base/c.html)`(`` `` ``"WNT1"``, ``"WNT2"``, ``"WNT2B"``, ``"WNT3"``, ``"WNT3A"``, ``"WNT4"``, ``"WNT5A"``, ``"WNT5B"``,`` `` ``"WNT6"``, ``"WNT7A"``, ``"WNT7B"``, ``"WNT8A"``, ``"WNT8B"``, ``"WNT9A"``, ``"WNT9B"``,`` `` ``"WNT10A"``, ``"WNT10B"``, ``"WNT11"``, ``"WNT16"`` ``)`` `` ``B`` ``<-`` `[`c`](https://rdrr.io/r/base/c.html)`(`` `` ``"FZD1"``, ``"FZD2"``, ``"FZD3"``, ``"FZD4"``, ``"FZD5"``, ``"FZD6"``, ``"FZD7"``,`` `` ``"FZD8"``, ``"FZD9"``, ``"FZD10"``, ``"LRP5"``, ``"LRP6"``, ``"ROR1"``, ``"ROR2"``, ``"RYK"`` ``)`

## Running the search

A grid this size is 285 separate PubMed searches. With an API key that
takes about half a minute; without one, closer to two. The vignette
skips the live call by default and fills in a synthetic matrix, so the
page builds whether or not NCBI is reachable. Every number below is
fake. Swap in your own gene lists and run the live version to get real
ones.

### NCBI API Key (Recommended)

For better performance and higher rate limits, we recommend obtaining an
NCBI API key:

- **Without API key**: 3 requests per second
- **With API key**: 10 requests per second

To obtain your free NCBI API key, visit:
<https://support.nlm.nih.gov/kbArticle/?pn=KA-05317>

Once you have your API key, pass it to
[`PubMatrix()`](https://toledoem.github.io/pubmatrixr/reference/PubMatrix.md)
like this:

`result`` ``<-`` `[`PubMatrix`](https://toledoem.github.io/pubmatrixr/reference/PubMatrix.md)`(`` `` A ``=`` ``A``,`` `` B ``=`` ``B``,`` `` API.key ``=`` ``"your_api_key_here"``,`` `` Database ``=`` ``"pubmed"`` ``)`

For live rendering, this vignette picks up the key from the
`NCBI_API_KEY` environment variable instead of hardcoding it, so no key
is stored in the file:

``` bash
NCBI_API_KEY=your_api_key_here PUBMATRIX_LIVE_VIGNETTE=true \
  Rscript -e 'pkgdown::build_site()'
```

`current_year`` ``<-`` `[`as.integer`](https://rdrr.io/r/base/integer.html)`(`[`format`](https://rdrr.io/r/base/format.html)`(`[`Sys.Date`](https://rdrr.io/r/base/Sys.time.html)`(``)``, ``"%Y"``)``)`` ``result`` ``<-`` `[`PubMatrix`](https://toledoem.github.io/pubmatrixr/reference/PubMatrix.md)`(`` `` A ``=`` ``A``,`` `` B ``=`` ``B``,`` `` API.key ``=`` ``ncbi_api_key``,`` `` Database ``=`` ``"pubmed"``,`` `` daterange ``=`` `[`c`](https://rdrr.io/r/base/c.html)`(``1990``, ``current_year``)``,`` `` outfile ``=`` ``"pubmatrix_result"`` ``)`

`# Offline deterministic example used for vignette rendering/package checks.`` ``result`` ``<-`` `[`outer`](https://rdrr.io/r/base/outer.html)`(`[`seq_along`](https://rdrr.io/r/base/seq.html)`(``B``)``, `[`seq_along`](https://rdrr.io/r/base/seq.html)`(``A``)``, ``function``(``i``, ``j``)`` ``{`` `` ``10`` ``+`` ``(``i`` ``*`` ``5``)`` ``+`` ``(``j`` ``*`` ``4``)`` ``+`` ``(``(``i`` ``+`` ``j``)`` `[`%%`](https://rdrr.io/r/base/Arithmetic.html)` ``5``)`` ``*`` ``2`` ``+`` ``(``(``i`` ``*`` ``j``)`` `[`%%`](https://rdrr.io/r/base/Arithmetic.html)` ``6``)`` ``}``)`` ``result`` ``<-`` `[`as.data.frame`](https://rdrr.io/r/base/as.data.frame.html)`(``result``, check.names ``=`` ``FALSE``)`` `[`colnames`](https://rdrr.io/r/base/colnames.html)`(``result``)`` ``<-`` ``A`` `[`rownames`](https://rdrr.io/r/base/colnames.html)`(``result``)`` ``<-`` ``B`

## Which genes get the most attention

Before looking at pairs, check the totals. These bar charts sum each
gene’s row or column and colour it by its strongest partner on the other
list, so you can see which receptor dominates a given ligand’s
literature and the other way round.

`# Create data frame for List A genes (rows) colored by List B genes (columns)`` ``a_genes_data`` ``<-`` `[`data.frame`](https://rdrr.io/r/base/data.frame.html)`(`` `` gene ``=`` `[`rownames`](https://rdrr.io/r/base/colnames.html)`(``result``)``,`` `` total_pubs ``=`` `[`rowSums`](https://rdrr.io/r/base/colSums.html)`(``result``)``,`` `` stringsAsFactors ``=`` ``FALSE`` ``)`` `` ``# Add color coding based on max overlap with B genes`` ``a_genes_data``$``max_b_gene`` ``<-`` `[`apply`](https://rdrr.io/r/base/apply.html)`(``result``, ``1``, ``function``(``x``)`` `[`colnames`](https://rdrr.io/r/base/colnames.html)`(``result``)``[`[`which.max`](https://rdrr.io/r/base/which.min.html)`(``x``)``]``)`` ``a_genes_data``$``max_overlap`` ``<-`` `[`apply`](https://rdrr.io/r/base/apply.html)`(``result``, ``1``, ``max``)`` `` ``# Create data frame for List B genes (columns) colored by List A genes (rows)`` ``b_genes_data`` ``<-`` `[`data.frame`](https://rdrr.io/r/base/data.frame.html)`(`` `` gene ``=`` `[`colnames`](https://rdrr.io/r/base/colnames.html)`(``result``)``,`` `` total_pubs ``=`` `[`colSums`](https://rdrr.io/r/base/colSums.html)`(``result``)``,`` `` stringsAsFactors ``=`` ``FALSE`` ``)`` `` ``# Add color coding based on max overlap with A genes`` ``b_genes_data``$``max_a_gene`` ``<-`` `[`apply`](https://rdrr.io/r/base/apply.html)`(``result``, ``2``, ``function``(``x``)`` `[`rownames`](https://rdrr.io/r/base/colnames.html)`(``result``)``[`[`which.max`](https://rdrr.io/r/base/which.min.html)`(``x``)``]``)`` ``b_genes_data``$``max_overlap`` ``<-`` `[`apply`](https://rdrr.io/r/base/apply.html)`(``result``, ``2``, ``max``)`` `` ``# Plot A genes colored by their strongest B gene partner`` ``p1`` ``<-`` `[`ggplot`](https://ggplot2.tidyverse.org/reference/ggplot.html)`(``a_genes_data``, `[`aes`](https://ggplot2.tidyverse.org/reference/aes.html)`(``x ``=`` `[`reorder`](https://rdrr.io/r/stats/reorder.factor.html)`(``gene``, ``total_pubs``)``, y ``=`` ``total_pubs``, fill ``=`` ``max_b_gene``)``)`` ``+`` `` `[`geom_bar`](https://ggplot2.tidyverse.org/reference/geom_bar.html)`(``stat ``=`` ``"identity"``)`` ``+`` `` `[`coord_flip`](https://ggplot2.tidyverse.org/reference/coord_flip.html)`(``)`` ``+`` `` `[`labs`](https://ggplot2.tidyverse.org/reference/labs.html)`(`` `` title ``=`` ``"List A Genes by Publication Count"``,`` `` subtitle ``=`` ``"Colored by strongest List B gene partner"``,`` `` x ``=`` ``"Genes (List A)"``,`` `` y ``=`` ``"Total Publications"``,`` `` fill ``=`` ``"Strongest B Partner"`` `` ``)`` ``+`` `` `[`theme_minimal`](https://ggplot2.tidyverse.org/reference/ggtheme.html)`(``)`` ``+`` `` `[`theme`](https://ggplot2.tidyverse.org/reference/theme.html)`(``legend.position ``=`` ``"bottom"``)`` ``+`` `` `[`scale_fill_viridis_d`](https://ggplot2.tidyverse.org/reference/scale_viridis.html)`(``)`` `` `` ``# Plot B genes colored by their strongest A gene partner`` ``p2`` ``<-`` `[`ggplot`](https://ggplot2.tidyverse.org/reference/ggplot.html)`(``b_genes_data``, `[`aes`](https://ggplot2.tidyverse.org/reference/aes.html)`(``x ``=`` `[`reorder`](https://rdrr.io/r/stats/reorder.factor.html)`(``gene``, ``total_pubs``)``, y ``=`` ``total_pubs``, fill ``=`` ``max_a_gene``)``)`` ``+`` `` `[`geom_bar`](https://ggplot2.tidyverse.org/reference/geom_bar.html)`(``stat ``=`` ``"identity"``)`` ``+`` `` `[`coord_flip`](https://ggplot2.tidyverse.org/reference/coord_flip.html)`(``)`` ``+`` `` `[`labs`](https://ggplot2.tidyverse.org/reference/labs.html)`(`` `` title ``=`` ``"List B Genes by Publication Count"``,`` `` subtitle ``=`` ``"Colored by strongest List A gene partner"``,`` `` x ``=`` ``"Genes (List B)"``,`` `` y ``=`` ``"Total Publications"``,`` `` fill ``=`` ``"Strongest A Partner"`` `` ``)`` ``+`` `` `[`theme_minimal`](https://ggplot2.tidyverse.org/reference/ggtheme.html)`(``)`` ``+`` `` `[`theme`](https://ggplot2.tidyverse.org/reference/theme.html)`(``legend.position ``=`` ``"bottom"``)`` ``+`` `` `[`scale_fill_viridis_d`](https://ggplot2.tidyverse.org/reference/scale_viridis.html)`(``)`` `` `` `[`print`](https://rdrr.io/r/base/print.html)`(``p1``)`

![](WntExample_files/figure-html/bar_plots-1.png)

[`print`](https://rdrr.io/r/base/print.html)`(``p2``)`

![](WntExample_files/figure-html/bar_plots-2.png)

## The full matrix

Raw PubMed publication counts for every ligand-receptor pair. Rows are
FZD/LRP/ROR/RYK receptors, columns are WNT ligands.

[`kable`](https://rdrr.io/pkg/knitr/man/kable.html)`(``result``,`` `` caption ``=`` ``"Co-occurrence Matrix: WNT Genes (Publication Counts)"``,`` `` align ``=`` ``"c"``,`` `` format ``=`` ``if`` ``(``knitr``::`[`pandoc_to`](https://rdrr.io/pkg/knitr/man/output_type.html)`(``)`` ``==`` ``"html"``)`` ``"html"`` ``else`` ``"markdown"`` ``)`` `[`%>%`](https://magrittr.tidyverse.org/reference/pipe.html)` `` ``kableExtra``::`[`kable_styling`](https://rdrr.io/pkg/kableExtra/man/kable_styling.html)`(`` `` bootstrap_options ``=`` `[`c`](https://rdrr.io/r/base/c.html)`(``"striped"``, ``"hover"``, ``"condensed"``)``,`` `` full_width ``=`` ``FALSE``,`` `` position ``=`` ``"center"`` `` ``)`` `[`%>%`](https://magrittr.tidyverse.org/reference/pipe.html)` `` ``kableExtra``::`[`add_header_above`](https://rdrr.io/pkg/kableExtra/man/add_header_above.html)`(`[`c`](https://rdrr.io/r/base/c.html)`(``" "`` ``=`` ``1``, ``"Wnt Genes"`` ``=`` `[`length`](https://rdrr.io/r/base/length.html)`(``A``)``)``)`

[TABLE]

Co-occurrence Matrix: WNT Genes (Publication Counts) {.table .table
.table-striped .table-hover .table-condensed
style="width: auto !important; margin-left: auto; margin-right: auto;"}

## Heatmaps

Nobody reads a 15x19 table of numbers. The heatmap shows the same data
as colour, and `show_numbers = TRUE` keeps the counts in the cells if
you still want them.

[`plot_pubmatrix_heatmap`](https://toledoem.github.io/pubmatrixr/reference/plot_pubmatrix_heatmap.md)`(`` `` matrix ``=`` ``result``,`` `` title ``=`` ``"WNT - Ligands v/s Receptors"``,`` `` show_numbers ``=`` ``TRUE`` ``)`

![](WntExample_files/figure-html/heatmap_with_numbers-1.png)

Dropping the numbers makes the pattern easier to see when you care about
the shape rather than the exact counts.

[`pubmatrix_heatmap`](https://toledoem.github.io/pubmatrixr/reference/pubmatrix_heatmap.md)`(``matrix ``=`` ``result``)`

![](WntExample_files/figure-html/heatmap_clean-1.png)

## System Information

[`sessionInfo`](https://rdrr.io/r/utils/sessionInfo.html)`(``)`

    ## R version 4.6.1 (2026-06-24)
    ## Platform: aarch64-apple-darwin23
    ## Running under: macOS Tahoe 26.6.2
    ## 
    ## Matrix products: default
    ## BLAS:   /Library/Frameworks/R.framework/Versions/4.6/Resources/lib/libRblas.0.dylib 
    ## LAPACK: /Library/Frameworks/R.framework/Versions/4.6/Resources/lib/libRlapack.dylib;  LAPACK version 3.12.1
    ## 
    ## locale:
    ## [1] C.UTF-8/C.UTF-8/C.UTF-8/C/C.UTF-8/C.UTF-8
    ## 
    ## time zone: Europe/London
    ## tzcode source: internal
    ## 
    ## attached base packages:
    ## [1] stats     graphics  grDevices utils     datasets  methods   base     
    ## 
    ## other attached packages:
    ## [1] ggplot2_4.0.3    pheatmap_1.0.13  dplyr_1.2.1      kableExtra_1.4.1
    ## [5] knitr_1.51       PubMatrixR_1.0.1
    ## 
    ## loaded via a namespace (and not attached):
    ##  [1] sass_0.4.10        generics_0.1.4     xml2_1.6.0         stringi_1.8.9     
    ##  [5] digest_0.6.39      magrittr_2.0.5     evaluate_1.0.5     grid_4.6.1        
    ##  [9] RColorBrewer_1.1-3 fastmap_1.2.0      jsonlite_2.0.0     viridisLite_0.4.3 
    ## [13] scales_1.4.0       pbapply_1.7-4      textshaping_1.0.5  jquerylib_0.1.4   
    ## [17] cli_3.6.6          rlang_1.3.0        withr_3.0.3        cachem_1.1.0      
    ## [21] yaml_2.3.12        otel_0.2.0         tools_4.6.1        parallel_4.6.1    
    ## [25] readODS_2.3.5      vctrs_0.7.3        R6_2.6.1           lifecycle_1.0.5   
    ## [29] stringr_1.6.0      fs_2.1.0           htmlwidgets_1.6.4  ragg_1.5.2        
    ## [33] pkgconfig_2.0.3    desc_1.4.3         pkgdown_2.2.1      bslib_0.12.0      
    ## [37] pillar_1.11.1      gtable_0.3.6       glue_1.8.1         systemfonts_1.3.2 
    ## [41] xfun_0.60          tibble_3.3.1       tidyselect_1.2.1   rstudioapi_0.19.0 
    ## [45] farver_2.1.2       htmltools_0.5.9    rmarkdown_2.31     svglite_2.2.2     
    ## [49] labeling_0.4.3     compiler_4.6.1     S7_0.2.2
