# Waigaya

This script supports your pair/mob programming.

## Usage

```shell script
Usage: waigaya [options] [command]

Options:
  -h, --help        display help for command

Commands:
  member [options]  waigaya member operation
  pair [options]    pair operation
  help [command]    display help for command
```

### Member command

```shell script
waigaya member --add

What's member's name ? : Jessica
What's member's id? : jesica
Do you work with those pairs [active/inactive]? : active

Saved member on repo
```

```shell script
waigaya member --list

Members:
     Walter, active
     Ian, active
     Gabe, active
     Amy, active
     Jessica, active
```

### Pair command
```shell script
waigaya pair --make

Making pair with history...

Today's pair:
     1: Walter, Gabe
     2: Ian, Amy

Do you work with those pairs [y/n]? : y
Saved paris on repo

```
```shell script
waigaya pair --history

Pair History:
     1: Walter, Gabe , Tue Apr 21 2020 08:50:03 GMT+0900 (日本標準時)
     2: Ian, Amy , Tue Apr 21 2020 08:50:03 GMT+0900 (日本標準時)
     3: Walter, Ian , Mon Apr 20 2020 09:14:03 GMT+0900 (日本標準時)
     4: Gabe, Amy , Mon Apr 20 2020 09:14:03 GMT+0900 (日本標準時)
     5: Walter, Amy , None
     6: Walter, Jessica , None
     7: Ian, Gabe , None
     8: Ian, Jessica , None
     9: Gabe, Jessica , None
     10: Amy, Jessica , None
```
