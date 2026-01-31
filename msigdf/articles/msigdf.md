# MSigDF: Molecular Signature Database (MSigDB) in a Data Frame

Abstract

This data package contains the Molecular Signature Database (MSigDB) for
both human and predicted mouse orthologs in separate data frames
(tibbles). Each data frame (`msigdf.human` and `msigdf.mouse`) contain
three columns: the collection (Hallmark, or c1-c8), the gene set, and
Entrez IDs for genes in that set. The `msigdf.urls` tibble contains
links to descriptions on the Broad Institute’s website of each gene set.
**[Source code available on
GitHub](https://github.com/ToledoEM/msigdf)**.

## Data sources

Original data from the Broad Institute’s Molecular Signature Database
(MSigDB)[^1], redistributed as separate gmt data files from the MSigDB.

------------------------------------------------------------------------

*The gene sets contained in the MSigDB are from a wide variety of
sources, and relate to a variety of species, mostly human. To facilitate
use of the MSigDB in our work, we have created a pure mouse version of
the MSigDB by mapping all sets to mouse orthologs. A pure human version
is also provided.*

***Procedure:***

*1. The current MSigDB v2026.1 gmt files were downloaded from Broad
ftp.*  
*2. This was done with the human and mouse gene sets*  
*3. Each collection was converted to a list in R, and written to a RData
file using [`save()`](https://rdrr.io/r/base/save.html).*

------------------------------------------------------------------------

See the script in `data-raw/` to see how the data frames (tibbles) were
created.

## Example usage

There are three data frames (tibbles) this package. The `msigdf.human`
data frame has columns for each MSigDB collection divided by
sub-collection (like cc, bp and mf for C5). The format of the data is
tidy, so each row is a single gene set collection, sub-collection and
gene symbol. The `msigdf.mouse` data frame has the same structure for
mouse orthologs. The `msigdf.urls` data frame links the name of the gene
set to the URL on the Broad’s website.

New C5 ontology information was added to the category subcode for easy
filtering and consistency.

- HPO: Human Phenotype Ontology
- MF: GO Molecular Function ontology
- BP: GO Biological Process ontology
- CC: GO Cellular Component ontology

The data sets in this package have several million rows. The package
imports the tibble package so they’re displayed nicely.

``` r

library(tidyverse)
library(msigdf)
```

Take a look:

``` r

msigdf.human %>% head()
```

    ## # A tibble: 6 × 4
    ##   category_code category_subcode geneset symbol 
    ##   <chr>         <chr>            <chr>   <chr>  
    ## 1 c1            all              MT      MT-ATP6
    ## 2 c1            all              MT      MT-ATP8
    ## 3 c1            all              MT      MT-CO1 
    ## 4 c1            all              MT      MT-CO2 
    ## 5 c1            all              MT      MT-CO3 
    ## 6 c1            all              MT      MT-CYB

``` r

msigdf.mouse %>% head()
```

    ## # A tibble: 6 × 4
    ##   category_code category_subcode geneset symbol 
    ##   <chr>         <chr>            <chr>   <chr>  
    ## 1 m1            all              MT      mt-Atp6
    ## 2 m1            all              MT      mt-Atp8
    ## 3 m1            all              MT      mt-Co1 
    ## 4 m1            all              MT      mt-Co2 
    ## 5 m1            all              MT      mt-Co3 
    ## 6 m1            all              MT      mt-Cytb

``` r

msigdf.urls %>% as.data.frame() %>% head()
```

    ##   category_code category_subcode  geneset
    ## 1            c1              all       MT
    ## 2            c1              all chr10p11
    ## 3            c1              all chr10p12
    ## 4            c1              all chr10p13
    ## 5            c1              all chr10p14
    ## 6            c1              all chr10p15
    ##                                                             url
    ## 1       http://software.broadinstitute.org/gsea/msigdb/cards/MT
    ## 2 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p11
    ## 3 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p12
    ## 4 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p13
    ## 5 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p14
    ## 6 http://software.broadinstitute.org/gsea/msigdb/cards/chr10p15

Just get the entries for the [KEGG non-homologous end joining
pathway](http://www.genome.jp/kegg/pathway/hsa/hsa03450.md):

``` r

msigdf.human %>% 
  filter(geneset=="KEGG_NON_HOMOLOGOUS_END_JOINING")
```

    ## # A tibble: 26 × 4
    ##    category_code category_subcode geneset                         symbol 
    ##    <chr>         <chr>            <chr>                           <chr>  
    ##  1 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING DCLRE1C
    ##  2 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING DNTT   
    ##  3 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING FEN1   
    ##  4 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING LIG4   
    ##  5 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING MRE11  
    ##  6 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING NHEJ1  
    ##  7 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING POLL   
    ##  8 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING POLM   
    ##  9 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING PRKDC  
    ## 10 c2            cp.kegg_legacy   KEGG_NON_HOMOLOGOUS_END_JOINING RAD50  
    ## # ℹ 16 more rows

Some software, e.g., [fGSEA](https://github.com/ctlab/fgsea) might
require gene sets to be a named list of genes identifiers, where the
name of each element in the list is the name of the pathway. This is how
the data was originally structured, and we can return to it with
[`plyr::dlply()`](https://rdrr.io/pkg/plyr/man/dlply.html). Here, let’s
use only the hallmark sets, and after we `dlply` the data into this
named list format, get just the first few pathways, and in each of
those, just display the first few gene symbols.

``` r

msigdf.human %>% 
  filter(category_code=="c2") %>% 
  select(geneset, symbol) %>% 
  group_by(geneset) %>% 
  summarize(symbol=list(symbol)) %>% 
  deframe() %>% 
  head() %>% 
  map(head)
```

    ## $ABBUD_LIF_SIGNALING_1_DN
    ## [1] "AHNAK"    "ALCAM"    "ANKRD40"  "ARID1A"   "BCKDHB"   "C16orf89"
    ## 
    ## $ABBUD_LIF_SIGNALING_1_UP
    ## [1] "ACAA2"   "ALDOC"   "ANXA8L1" "BCL3"    "CEBPB"   "CXCL14" 
    ## 
    ## $ABBUD_LIF_SIGNALING_2_DN
    ## [1] "CGA"    "CITED2" "NALCN"  "PITX2"  "PTHLH"  "SCN1A" 
    ## 
    ## $ABBUD_LIF_SIGNALING_2_UP
    ## [1] "ATP1B1"  "COL11A1" "DAB2"    "DCN"     "DIO2"    "EZR"    
    ## 
    ## $ABDELMOHSEN_ELAVL4_TARGETS
    ## [1] "BCL2"  "CAB39" "CASP3" "CDC42" "CDH2"  "DLG4" 
    ## 
    ## $ABDULRAHMAN_KIDNEY_CANCER_VHL_DN
    ## [1] "ACTA2"   "ALDH1A1" "ALDH3B1" "ITGB3BP" "MPPE1"   "MTMR3"

## Further exploration

The number of gene sets in each collection for each organism is
dependent of the construction at MSigDB.

**Human Collection of gene sets**
<https://www.gsea-msigdb.org/gsea/msigdb/human/collections.jsp>

``` r

msigdf.human %>%
  group_by(category_code,category_subcode) %>% 
  tally()
```

    ## # A tibble: 29 × 3
    ## # Groups:   category_code [10]
    ##    category_code category_subcode      n
    ##    <chr>         <chr>             <int>
    ##  1 c1            all               43707
    ##  2 c2            cgp              408654
    ##  3 c2            cp               179627
    ##  4 c2            cp.biocarta        4814
    ##  5 c2            cp.kegg_legacy    12801
    ##  6 c2            cp.kegg_medicus    9662
    ##  7 c2            cp.pid             8054
    ##  8 c2            cp.reactome      102437
    ##  9 c2            cp.wikipathways   41280
    ## 10 c3            mir              406232
    ## # ℹ 19 more rows

**Mouse Collection of gene sets**
<https://www.gsea-msigdb.org/gsea/msigdb/mouse/collections.jsp>

``` r

msigdf.mouse %>%
  group_by(category_code,category_subcode) %>% 
  tally()
```

    ## # A tibble: 16 × 3
    ## # Groups:   category_code [7]
    ##    category_code category_subcode      n
    ##    <chr>         <chr>             <int>
    ##  1 m1            all               41400
    ##  2 m2            cgp              116378
    ##  3 m2            cp                89841
    ##  4 m2            cp.biocarta        3959
    ##  5 m2            cp.reactome       75097
    ##  6 m2            cp.wikipathways   10785
    ##  7 m3            gtrd             163326
    ##  8 m3            mirdb            233370
    ##  9 m5            go               878221
    ## 10 m5            go.bp            651755
    ## 11 m5            go.cc            112349
    ## 12 m5            go.mf            114117
    ## 13 m5            mpt                2606
    ## 14 m7            all               70547
    ## 15 m8            all               47976
    ## 16 mh            all                7191

Get the URL for the hallmark set with the fewest number of genes (Notch
signaling). Optionally, `%>%` this to `browseURL` to open it up in your
browser.

``` r

msigdf.human %>%
  filter(category_code=="h") %>%
  count(geneset) %>%
  arrange(n) %>%
  head(1) %>%
  inner_join(msigdf.urls, by="geneset") %>%
  pull(url)
```

    ## [1] "http://software.broadinstitute.org/gsea/msigdb/cards/HALLMARK_NOTCH_SIGNALING"

Just look at the number of genes in each KEGG pathway (sorted descending
by the number of genes in that pathway):

``` r

msigdf.human %>%
  filter(category_code=="c2" & grepl("^KEGG_", geneset)) %>%
  count(geneset) %>% 
  arrange(desc(n))
```

    ## # A tibble: 844 × 2
    ##    geneset                                          n
    ##    <chr>                                        <int>
    ##  1 KEGG_OLFACTORY_TRANSDUCTION                    778
    ##  2 KEGG_PATHWAYS_IN_CANCER                        650
    ##  3 KEGG_NEUROACTIVE_LIGAND_RECEPTOR_INTERACTION   544
    ##  4 KEGG_MAPK_SIGNALING_PATHWAY                    534
    ##  5 KEGG_CYTOKINE_CYTOKINE_RECEPTOR_INTERACTION    528
    ##  6 KEGG_REGULATION_OF_ACTIN_CYTOSKELETON          426
    ##  7 KEGG_FOCAL_ADHESION                            398
    ##  8 KEGG_CHEMOKINE_SIGNALING_PATHWAY               376
    ##  9 KEGG_HUNTINGTONS_DISEASE                       366
    ## 10 KEGG_ENDOCYTOSIS                               362
    ## # ℹ 834 more rows

## Session info

    ## R version 4.5.2 (2025-10-31)
    ## Platform: aarch64-apple-darwin20
    ## Running under: macOS Tahoe 26.2
    ## 
    ## Matrix products: default
    ## BLAS:   /System/Library/Frameworks/Accelerate.framework/Versions/A/Frameworks/vecLib.framework/Versions/A/libBLAS.dylib 
    ## LAPACK: /Library/Frameworks/R.framework/Versions/4.5-arm64/Resources/lib/libRlapack.dylib;  LAPACK version 3.12.1
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
    ##  [1] msigdf_2026.1   lubridate_1.9.4 forcats_1.0.1   stringr_1.6.0  
    ##  [5] dplyr_1.1.4     purrr_1.2.1     readr_2.1.6     tidyr_1.3.2    
    ##  [9] tibble_3.3.1    ggplot2_4.0.1   tidyverse_2.0.0 knitr_1.51     
    ## 
    ## loaded via a namespace (and not attached):
    ##  [1] sass_0.4.10        utf8_1.2.6         generics_0.1.4     stringi_1.8.7     
    ##  [5] hms_1.1.4          digest_0.6.39      magrittr_2.0.4     evaluate_1.0.5    
    ##  [9] grid_4.5.2         timechange_0.4.0   RColorBrewer_1.1-3 fastmap_1.2.0     
    ## [13] jsonlite_2.0.0     scales_1.4.0       textshaping_1.0.4  jquerylib_0.1.4   
    ## [17] cli_3.6.5          rlang_1.1.7        withr_3.0.2        cachem_1.1.0      
    ## [21] yaml_2.3.12        otel_0.2.0         tools_4.5.2        tzdb_0.5.0        
    ## [25] vctrs_0.7.1        R6_2.6.1           lifecycle_1.0.5    fs_1.6.6          
    ## [29] htmlwidgets_1.6.4  ragg_1.5.0         pkgconfig_2.0.3    desc_1.4.3        
    ## [33] pkgdown_2.2.0      pillar_1.11.1      bslib_0.10.0       gtable_0.3.6      
    ## [37] glue_1.8.0         systemfonts_1.3.1  xfun_0.56          tidyselect_1.2.1  
    ## [41] farver_2.1.2       htmltools_0.5.9    rmarkdown_2.30     compiler_4.5.2    
    ## [45] S7_0.2.1

[^1]: <http://www.broad.mit.edu/gsea/msigdb/index.jsp>
