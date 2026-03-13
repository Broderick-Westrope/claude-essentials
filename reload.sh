#! /bin/bash

# This script uninstalls and reinstalls the ce plugin. This is a workaround to get the plugin to work locally after making some changes that are not pushed and tagged with a version yet.
claude plugin uninstall ce@claude-essentials
claude plugin install ce@claude-essentials