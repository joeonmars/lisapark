#!/bin/bash
BASEDIR=$(dirname $0)
echo "Script location: ${BASEDIR}"

uglifyjs ${BASEDIR}/jquery-1.8.3.min.js \
				 ${BASEDIR}/jquery.localscroll-1.2.7-min.js \
				 ${BASEDIR}/jquery.mobilemenu.js \
				 ${BASEDIR}/jquery.easing.1.3.js \
				 ${BASEDIR}/jquery.flexslider.js \
				 ${BASEDIR}/jquery.foundation.reveal.js \
				 ${BASEDIR}/jquery.ba-hashchange.min.js \
				 ${BASEDIR}/jquery.isotope.min.js \
				 ${BASEDIR}/preloadjs-0.3.0.min.js \
				 ${BASEDIR}/contact.js \
				 ${BASEDIR}/addons.js \
         -o ${BASEDIR}/minified.js \