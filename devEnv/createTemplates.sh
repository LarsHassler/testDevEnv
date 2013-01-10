java -jar ../deps/soy/SoyToJsSrcCompiler.jar \
  --shouldProvideRequireSoyNamespaces \
  --shouldGenerateJsdoc \
  --outputPathFormat ../templates/_compiled/{INPUT_FILE_NAME_NO_EXT}.soy.js \
  --srcs ../templates/test/testTemplate.soy