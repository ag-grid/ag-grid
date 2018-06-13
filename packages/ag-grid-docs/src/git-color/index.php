<?php

$pageTitle = "ag-Grid Blog: Git on the Command Line - Improving the Experience";
$pageDescription = "This blog covers how to add some colour into your Git life. A quick step-by-step guide to customising your command line.";
$pageKeyboards = "Git Command Line";

include('../includes/mediaHeader.php');
?>

<link rel="stylesheet" href="../documentation-main/documentation.css">
<script src="../documentation-main/documentation.js"></script>


        <h1> Git on the Command Line - Improving the Experience</h1>
        <p class="blog-author">Sean Landsman | 6th February 2017</p>

<div class="row" ng-app="documentation">
    <div class="col-md-8">

        <h2>Git</h2>

        <p>Git is great. Git was a breath of fresh air for those of use who came from a background of SVN, Perforce, ClearCase
            or...<span style="font-style: italic">*shudder*</span>, CVS.</p>

        <p>We at ag-Grid love open-source, and our VCS of choice is Git, with Github our choice of host.</p>

        <p>Although I live most of my time in my IDE (IntelliJ FTW!) when it comes to version control I almost always
            drop down to the command line. The support for Git in most IDEs is great - it's more of a personal preference.</p>
        <p>
            I can script common tasks from the command line (although of course you could execute these script from the IDE),
            and don't have to worry about synchronizing the IDE to the state of the file system (a rare problem to be fair).
            What the command line tells me is the truth - if I want to know what the state my project is <code>git status</code> tells me, in
            a quick to parse information dump.</p>

        <p>Familiarity and habit may also play a large part of my love of the command line though...</p>

        <p>Out of the box Git is great, but without too much effort the command line experience can be improved a great
            deal. With a bit of colour we and a few icons we can, at a glance, get most of the information we commonly require
        from Git.</p>

        <p>Do we have modified files? Check. Do we have files that are untracked? Check. What branch am I in at the moment? Got that
        covered. And so on.</p>

        <p>At the end of my playing around this is what I now use day to day here at ag-Grid:</p>

        <img src="../images/git_current_cmd_line.png" style="width: 100%;padding-bottom: 10px">

        <p>At a glance I can seee who I'm logged in as (<code>seanlandsman</code>), which host I'm on (<code>MPB</code>),
            the current directory (<code>ag-grid-dev</code>), what branch (<code>master</code>), the
            number of modified files (<code>+1</code>) and the number of untracked files (<code>+1</code>).</p>

        <p>If I happened to be in a non-Git controlled directory then the branch and file status information would not be shown.</p>

        <h2>Adding Colour to Git - The Basics</h2>

        <p>
            You can add colour to Git output by modifying <code>~/.gitconfig</code>. The following will add colour to the main
            Git commands:
        </p>

<snippet>
[color]
    branch = auto
    diff = auto
    status = auto
[color "branch"]
    current = yellow reverse
    local = yellow
    remote = green
[color "diff"]
    meta = yellow bold
    frag = magenta bold
    old = red bold
    new = green bold
[color "status"]
    added = yellow
    changed = green
    untracked = cyan</snippet>

        <img src="../images/git_status.png" style="width: 100%;padding-bottom: 10px">

        <p>This is great and already helps visually distinguish between the different pieces of information - a good start!</p>

        <h2>Information...Without Asking</h2>

        <p>The above helps, but relies us executing Git commands to get the current state of play. This is fine of course,
        but if like me you'd like a gentle reminder of what's going on, and where you are, then we can improve on this.</p>

        <h3>bash-git-prompt</h3>

        <p><a href="https://github.com/magicmonty/bash-git-prompt" target="_blank"><code>bash-git-prompt</code></a> is a shell
            script maintained by Martin Gondermann which adds information to the command line for us.</p>

        <note>As with any any executable from the web there is a risk. I've read through the script and am happy with what it's
            doing, but please ensure you're happy with it before trying this too!</note>

        <p>You can install this either via Git clone, or via Homebrew. I work primarily on OSX and found the cloning method
            easier, but both should work.</p>

<snippet>
cd ~
git clone https://github.com/magicmonty/bash-git-prompt.git .bash-git-prompt --depth=1</snippet>

        <p>This will create a directory within your home directory called <code>.bash-git-prompt</code>, which does the work of
            executing Git status commands and returning the results in a format with icons and colours - all of which is
            configurable.</p>

        <p>Next we need to ensure the script is run when we're in the terminal. Add the following to ~/.bashrc:</p>

<snippet>
GIT_PROMPT_ONLY_IN_REPO=1
source ~/.bash-git-prompt/gitprompt.sh</snippet>

        <p><code>GIT_PROMPT_ONLY_IN_REPO=1</code> will ensure that the Git output will only be done in Git managed directories.</p>

        <p>As the terminal opens a login shell, your <code>.bashrc</code> may not get excuted in new windows. While experimenting
        you may want to add this to your <code>.bash_profile</code> to ensure your changes are picked up each time you open a
        new terminal window:</p>

        <snippet>
[[ -s ~/.bashrc ]] && source ~/.bashrc</snippet>

        <p>The default configuration would give you an output something like this:</p>

        <img src="../images/get_default_output.png" style="width: 100%;padding-bottom: 10px">

        <p>This is a good start, but all of this is configurable. For my use case I'd prefer to keep the output a little
            terser, partly as when I'm working exclusively on my laptop screen real estate becomes a premium.</p>

        <p>I also (occasionally) work on remote hosts and it's a good reminder to know what and who I am when I'm there,
            so I'd like to have this shown too.</p>

        <p>Finally, although nice I don't really need to know the status of the last command excuted (the little green tick at the
        start indicates this).</p>

        <p>Themes are how <code>bash-git-prompt</code> allows for user configuration
        of the output. There are a number of themes provide with <code>bash-git-prompt</code> and I'd encourage you to try them
        to see what's possible, but in my case I decided to tweak the output to something bespoke.</p>

        <snippet>
git_prompt_make_custom_theme Default</snippet>

        <p>The above will create a new theme file (<code>~/.git-prompt-colors.sh</code>) based on the Default theme.</p>

        <p>I won't list the entire file contents here, but will highlight the parts I've changed:</p>

<snippet>
// just the current directory name - not the full path
PathShort="\W";

// round brackets surround the Git output
// I prefer them to square brackets - I couldn't tell you why ;-)
GIT_PROMPT_PREFIX="("                 # start of the git info string
GIT_PROMPT_SUFFIX=")"                 # the end of the git info string

// change a couple of the colours to be inline with what I've configured in Git
GIT_PROMPT_CHANGED="${Green}✚ "        # the number of changed files
GIT_PROMPT_UNTRACKED="${Red}…"       # the number of untracked files/dirs

// The pre-Git output - show username@host current-directory
// This information will be displayed all the time, even if not in a Git controlled directory
GIT_PROMPT_START_USER="${USER}@${HOSTNAME} ${Yellow}${PathShort}${ResetColor}"</snippet>

        <p>That's it! With these small changes in place I'm done - I have the output I wanted with very little configuration.</p>

        <p>I encourage you to give this a go, and experiment with the provided themes - you may find one of them already
            does want you want. I'd also encourage you to read the docs in the <a
                    href="https://github.com/magicmonty/bash-git-prompt">bash-git-prompt</a> page - there's a lot of good information
            there.</p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button"
               data-url="https://www.ag-grid.com/git-color/"
               data-text="Git on the Command Line - Improving the Experience" data-via="seanlandsman"
               data-size="large">Tweet</a>
            <script>!function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                    if (!d.getElementById(id)) {
                        js = d.createElement(s);
                        js.id = id;
                        js.src = p + '://platform.twitter.com/widgets.js';
                        fjs.parentNode.insertBefore(js, fjs);
                    }
                }(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
<?php include '../blog-authors/sean.php'; ?>
</div>


<hr/>

<div id="disqus_thread"></div>
<script type="text/javascript">
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'aggrid';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function () {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments
        powered by Disqus.</a></noscript>
<hr/>

<footer class="license">
    © ag-Grid Ltd. 2015-2017
</footer>

<?php
include('../includes/mediaFooter.php');
?>
