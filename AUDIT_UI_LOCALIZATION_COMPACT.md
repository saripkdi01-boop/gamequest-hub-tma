# UI Localization and Compact Audit

## Client files
client/src/components/AIChatBox.tsx
client/src/components/DashboardLayout.tsx
client/src/components/DashboardLayoutSkeleton.tsx
client/src/components/ErrorBoundary.tsx
client/src/components/GameCanvas.tsx
client/src/components/LanguageSwitcher.tsx
client/src/components/ManusDialog.tsx
client/src/components/Map.tsx
client/src/components/ui/accordion.tsx
client/src/components/ui/alert-dialog.tsx
client/src/components/ui/alert.tsx
client/src/components/ui/aspect-ratio.tsx
client/src/components/ui/avatar.tsx
client/src/components/ui/badge.tsx
client/src/components/ui/breadcrumb.tsx
client/src/components/ui/button-group.tsx
client/src/components/ui/button.tsx
client/src/components/ui/calendar.tsx
client/src/components/ui/card.tsx
client/src/components/ui/carousel.tsx
client/src/components/ui/chart.tsx
client/src/components/ui/checkbox.tsx
client/src/components/ui/collapsible.tsx
client/src/components/ui/command.tsx
client/src/components/ui/context-menu.tsx
client/src/components/ui/dialog.tsx
client/src/components/ui/drawer.tsx
client/src/components/ui/dropdown-menu.tsx
client/src/components/ui/empty.tsx
client/src/components/ui/field.tsx
client/src/components/ui/form.tsx
client/src/components/ui/hover-card.tsx
client/src/components/ui/input-group.tsx
client/src/components/ui/input-otp.tsx
client/src/components/ui/input.tsx
client/src/components/ui/item.tsx
client/src/components/ui/kbd.tsx
client/src/components/ui/label.tsx
client/src/components/ui/menubar.tsx
client/src/components/ui/navigation-menu.tsx
client/src/components/ui/pagination.tsx
client/src/components/ui/popover.tsx
client/src/components/ui/progress.tsx
client/src/components/ui/radio-group.tsx
client/src/components/ui/resizable.tsx
client/src/components/ui/scroll-area.tsx
client/src/components/ui/select.tsx
client/src/components/ui/separator.tsx
client/src/components/ui/sheet.tsx
client/src/components/ui/sidebar.tsx
client/src/components/ui/skeleton.tsx
client/src/components/ui/slider.tsx
client/src/components/ui/sonner.tsx
client/src/components/ui/spinner.tsx
client/src/components/ui/switch.tsx
client/src/components/ui/table.tsx
client/src/components/ui/tabs.tsx
client/src/components/ui/textarea.tsx
client/src/components/ui/toggle-group.tsx
client/src/components/ui/toggle.tsx
client/src/components/ui/tooltip.tsx
client/src/pages/ComponentShowcase.tsx
client/src/pages/ExploreRoute.tsx
client/src/pages/Home.tsx
client/src/pages/Leaderboard.tsx
client/src/pages/NotFound.tsx
client/src/pages/Profile.tsx
client/src/pages/QuestResult.tsx
client/src/pages/QuestRun.tsx
client/src/pages/QuizArena.tsx
client/src/pages/RewardBonus.tsx

## Hard-coded English and mixed-language candidates
client/src/pages/ComponentShowcase.tsx:173:import { toast as sonnerToast } from "sonner";
client/src/pages/ComponentShowcase.tsx:174:import { AIChatBox, type Message } from "@/components/AIChatBox";
client/src/pages/ComponentShowcase.tsx:176:export default function ComponentsShowcase() {
client/src/pages/ComponentShowcase.tsx:178:  const [date, setDate] = useState<Date | undefined>(new Date());
client/src/pages/ComponentShowcase.tsx:190:  // AI ChatBox demo state
client/src/pages/ComponentShowcase.tsx:192:    { role: "system", content: "You are a helpful assistant." },
client/src/pages/ComponentShowcase.tsx:196:  const handleDialogSubmit = () => {
client/src/pages/ComponentShowcase.tsx:197:    console.log("Dialog submitted with value:", dialogInput);
client/src/pages/ComponentShowcase.tsx:198:    sonnerToast.success("Submitted successfully", {
client/src/pages/ComponentShowcase.tsx:205:  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
client/src/pages/ComponentShowcase.tsx:206:    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
client/src/pages/ComponentShowcase.tsx:212:  const handleChatSend = (content: string) => {
client/src/pages/ComponentShowcase.tsx:213:    // Add user message
client/src/pages/ComponentShowcase.tsx:214:    const newMessages: Message[] = [...chatMessages, { role: "user", content }];
client/src/pages/ComponentShowcase.tsx:217:    // Simulate AI response with delay
client/src/pages/ComponentShowcase.tsx:220:      const aiResponse: Message = {
client/src/pages/ComponentShowcase.tsx:222:        content: `This is a **demo response**. In a real app, you would call a tRPC mutation here:\n\n\`\`\`typescript\nconst chatMutation = trpc.ai.chat.useMutation({\n  onSuccess: (response) => {\n    setChatMessages(prev => [...prev, {\n      role: "assistant",\n      content: response.choices[0].message.content\n    }]);\n  }\n});\n\nchatMutation.mutate({ messages: newMessages });\n\`\`\`\n\nYour message was: "${content}"`,
client/src/pages/ComponentShowcase.tsx:230:    <div className="min-h-screen bg-background text-foreground">
client/src/pages/ComponentShowcase.tsx:231:      <main className="container max-w-6xl mx-auto">
client/src/pages/ComponentShowcase.tsx:232:        <div className="space-y-2 justify-between flex">
client/src/pages/ComponentShowcase.tsx:233:          <h2 className="text-3xl font-bold tracking-tight mb-6">
client/src/pages/ComponentShowcase.tsx:234:            Shadcn/ui Component Library
client/src/pages/ComponentShowcase.tsx:236:          <Button variant="outline" size="icon" onClick={toggleTheme}>
client/src/pages/ComponentShowcase.tsx:238:              <Moon className="h-5 w-5" />
client/src/pages/ComponentShowcase.tsx:240:              <Sun className="h-5 w-5" />
client/src/pages/ComponentShowcase.tsx:245:        <div className="space-y-12">
client/src/pages/ComponentShowcase.tsx:246:          {/* Text Colors Section */}
client/src/pages/ComponentShowcase.tsx:247:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:248:            <h3 className="text-2xl font-semibold">Text Colors</h3>
client/src/pages/ComponentShowcase.tsx:250:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:251:                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
client/src/pages/ComponentShowcase.tsx:252:                  <div className="space-y-3">
client/src/pages/ComponentShowcase.tsx:254:                      <p className="text-sm text-muted-foreground mb-1">
client/src/pages/ComponentShowcase.tsx:257:                      <p className="text-foreground text-lg">
client/src/pages/ComponentShowcase.tsx:258:                        Default text color for main content
client/src/pages/ComponentShowcase.tsx:262:                      <p className="text-sm text-muted-foreground mb-1">
client/src/pages/ComponentShowcase.tsx:263:                        Muted Foreground
client/src/pages/ComponentShowcase.tsx:265:                      <p className="text-muted-foreground text-lg">
client/src/pages/ComponentShowcase.tsx:266:                        Muted text for secondary information
client/src/pages/ComponentShowcase.tsx:270:                      <p className="text-sm text-muted-foreground mb-1">
client/src/pages/ComponentShowcase.tsx:273:                      <p className="text-primary text-lg font-medium">
client/src/pages/ComponentShowcase.tsx:274:                        Primary brand color text
client/src/pages/ComponentShowcase.tsx:278:                      <p className="text-sm text-muted-foreground mb-1">
client/src/pages/ComponentShowcase.tsx:279:                        Secondary Foreground
client/src/pages/ComponentShowcase.tsx:281:                      <p className="text-secondary-foreground text-lg">
client/src/pages/ComponentShowcase.tsx:282:                        Secondary action text color
client/src/pages/ComponentShowcase.tsx:286:                  <div className="space-y-3">
client/src/pages/ComponentShowcase.tsx:288:                      <p className="text-sm text-muted-foreground mb-1">
client/src/pages/ComponentShowcase.tsx:289:                        Accent Foreground
client/src/pages/ComponentShowcase.tsx:291:                      <p className="text-accent-foreground text-lg">
client/src/pages/ComponentShowcase.tsx:292:                        Accent text for emphasis
client/src/pages/ComponentShowcase.tsx:296:                      <p className="text-sm text-muted-foreground mb-1">
client/src/pages/ComponentShowcase.tsx:299:                      <p className="text-destructive text-lg font-medium">
client/src/pages/ComponentShowcase.tsx:300:                        Error or destructive action text
client/src/pages/ComponentShowcase.tsx:304:                      <p className="text-sm text-muted-foreground mb-1">
client/src/pages/ComponentShowcase.tsx:305:                        Card Foreground
client/src/pages/ComponentShowcase.tsx:307:                      <p className="text-card-foreground text-lg">
client/src/pages/ComponentShowcase.tsx:308:                        Text color on card backgrounds
client/src/pages/ComponentShowcase.tsx:312:                      <p className="text-sm text-muted-foreground mb-1">
client/src/pages/ComponentShowcase.tsx:313:                        Popover Foreground
client/src/pages/ComponentShowcase.tsx:315:                      <p className="text-popover-foreground text-lg">
client/src/pages/ComponentShowcase.tsx:316:                        Text color in popovers
client/src/pages/ComponentShowcase.tsx:325:          {/* Color Combinations Section */}
client/src/pages/ComponentShowcase.tsx:326:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:327:            <h3 className="text-2xl font-semibold">Color Combinations</h3>
client/src/pages/ComponentShowcase.tsx:329:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:330:                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
client/src/pages/ComponentShowcase.tsx:331:                  <div className="bg-primary text-primary-foreground rounded-lg p-4">
client/src/pages/ComponentShowcase.tsx:332:                    <p className="font-medium mb-1">Primary</p>
client/src/pages/ComponentShowcase.tsx:334:                      Primary background with foreground text
client/src/pages/ComponentShowcase.tsx:337:                  <div className="bg-secondary text-secondary-foreground rounded-lg p-4">
client/src/pages/ComponentShowcase.tsx:338:                    <p className="font-medium mb-1">Secondary</p>
client/src/pages/ComponentShowcase.tsx:340:                      Secondary background with foreground text
client/src/pages/ComponentShowcase.tsx:343:                  <div className="bg-muted text-muted-foreground rounded-lg p-4">
client/src/pages/ComponentShowcase.tsx:344:                    <p className="font-medium mb-1">Muted</p>
client/src/pages/ComponentShowcase.tsx:346:                      Muted background with foreground text
client/src/pages/ComponentShowcase.tsx:349:                  <div className="bg-accent text-accent-foreground rounded-lg p-4">
client/src/pages/ComponentShowcase.tsx:350:                    <p className="font-medium mb-1">Accent</p>
client/src/pages/ComponentShowcase.tsx:352:                      Accent background with foreground text
client/src/pages/ComponentShowcase.tsx:355:                  <div className="bg-destructive text-destructive-foreground rounded-lg p-4">
client/src/pages/ComponentShowcase.tsx:356:                    <p className="font-medium mb-1">Destructive</p>
client/src/pages/ComponentShowcase.tsx:358:                      Destructive background with foreground text
client/src/pages/ComponentShowcase.tsx:361:                  <div className="bg-card text-card-foreground rounded-lg p-4 border">
client/src/pages/ComponentShowcase.tsx:362:                    <p className="font-medium mb-1">Card</p>
client/src/pages/ComponentShowcase.tsx:364:                      Card background with foreground text
client/src/pages/ComponentShowcase.tsx:367:                  <div className="bg-popover text-popover-foreground rounded-lg p-4 border">
client/src/pages/ComponentShowcase.tsx:368:                    <p className="font-medium mb-1">Popover</p>
client/src/pages/ComponentShowcase.tsx:370:                      Popover background with foreground text
client/src/pages/ComponentShowcase.tsx:373:                  <div className="bg-background text-foreground rounded-lg p-4 border">
client/src/pages/ComponentShowcase.tsx:374:                    <p className="font-medium mb-1">Background</p>
client/src/pages/ComponentShowcase.tsx:376:                      Default background with foreground text
client/src/pages/ComponentShowcase.tsx:384:          {/* Buttons Section */}
client/src/pages/ComponentShowcase.tsx:385:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:388:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:389:                <div className="flex flex-wrap gap-4">
client/src/pages/ComponentShowcase.tsx:391:                  <Button variant="secondary">Secondary</Button>
client/src/pages/ComponentShowcase.tsx:392:                  <Button variant="destructive">Destructive</Button>
client/src/pages/ComponentShowcase.tsx:393:                  <Button variant="outline">Outline</Button>
client/src/pages/ComponentShowcase.tsx:394:                  <Button variant="ghost">Ghost</Button>
client/src/pages/ComponentShowcase.tsx:395:                  <Button variant="link">Link</Button>
client/src/pages/ComponentShowcase.tsx:396:                  <Button size="sm">Small</Button>
client/src/pages/ComponentShowcase.tsx:397:                  <Button size="lg">Large</Button>
client/src/pages/ComponentShowcase.tsx:398:                  <Button size="icon">
client/src/pages/ComponentShowcase.tsx:399:                    <Check className="h-4 w-4" />
client/src/pages/ComponentShowcase.tsx:406:          {/* Form Inputs Section */}
client/src/pages/ComponentShowcase.tsx:407:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:408:            <h3 className="text-2xl font-semibold">Form Inputs</h3>
client/src/pages/ComponentShowcase.tsx:410:              <CardContent className="pt-6 space-y-6">
client/src/pages/ComponentShowcase.tsx:411:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:412:                  <Label htmlFor="email">Email</Label>
client/src/pages/ComponentShowcase.tsx:413:                  <Input id="email" type="email" placeholder="Email" />
client/src/pages/ComponentShowcase.tsx:415:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:416:                  <Label htmlFor="message">Message</Label>
client/src/pages/ComponentShowcase.tsx:419:                    placeholder="Type your message here."
client/src/pages/ComponentShowcase.tsx:422:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:426:                      <SelectValue placeholder="Select a fruit" />
client/src/pages/ComponentShowcase.tsx:429:                      <SelectItem value="apple">Apple</SelectItem>
client/src/pages/ComponentShowcase.tsx:430:                      <SelectItem value="banana">Banana</SelectItem>
client/src/pages/ComponentShowcase.tsx:431:                      <SelectItem value="orange">Orange</SelectItem>
client/src/pages/ComponentShowcase.tsx:435:                <div className="flex items-center space-x-2">
client/src/pages/ComponentShowcase.tsx:436:                  <Checkbox id="terms" />
client/src/pages/ComponentShowcase.tsx:437:                  <Label htmlFor="terms">Accept terms and conditions</Label>
client/src/pages/ComponentShowcase.tsx:439:                <div className="flex items-center space-x-2">
client/src/pages/ComponentShowcase.tsx:440:                  <Switch id="airplane-mode" />
client/src/pages/ComponentShowcase.tsx:441:                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
client/src/pages/ComponentShowcase.tsx:443:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:444:                  <Label>Radio Group</Label>
client/src/pages/ComponentShowcase.tsx:445:                  <RadioGroup defaultValue="option-one">
client/src/pages/ComponentShowcase.tsx:446:                    <div className="flex items-center space-x-2">
client/src/pages/ComponentShowcase.tsx:447:                      <RadioGroupItem value="option-one" id="option-one" />
client/src/pages/ComponentShowcase.tsx:448:                      <Label htmlFor="option-one">Option One</Label>
client/src/pages/ComponentShowcase.tsx:450:                    <div className="flex items-center space-x-2">
client/src/pages/ComponentShowcase.tsx:451:                      <RadioGroupItem value="option-two" id="option-two" />
client/src/pages/ComponentShowcase.tsx:452:                      <Label htmlFor="option-two">Option Two</Label>
client/src/pages/ComponentShowcase.tsx:456:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:458:                  <Slider defaultValue={[50]} max={100} step={1} />
client/src/pages/ComponentShowcase.tsx:460:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:461:                  <Label>Input OTP</Label>
client/src/pages/ComponentShowcase.tsx:462:                  <InputOTP maxLength={6}>
client/src/pages/ComponentShowcase.tsx:464:                      <InputOTPSlot index={0} />
client/src/pages/ComponentShowcase.tsx:465:                      <InputOTPSlot index={1} />
client/src/pages/ComponentShowcase.tsx:466:                      <InputOTPSlot index={2} />
client/src/pages/ComponentShowcase.tsx:467:                      <InputOTPSlot index={3} />
client/src/pages/ComponentShowcase.tsx:468:                      <InputOTPSlot index={4} />
client/src/pages/ComponentShowcase.tsx:469:                      <InputOTPSlot index={5} />
client/src/pages/ComponentShowcase.tsx:473:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:474:                  <Label>Date Time Picker</Label>
client/src/pages/ComponentShowcase.tsx:476:                    <PopoverTrigger asChild>
client/src/pages/ComponentShowcase.tsx:479:                        className={`w-full justify-start text-left font-normal ${
client/src/pages/ComponentShowcase.tsx:483:                        <CalendarIcon className="mr-2 h-4 w-4" />
client/src/pages/ComponentShowcase.tsx:485:                          format(datePickerDate, "PPP HH:mm", { locale: zhCN })
client/src/pages/ComponentShowcase.tsx:487:                          <span>Select date and time</span>
client/src/pages/ComponentShowcase.tsx:491:                    <PopoverContent className="w-auto p-0" align="start">
client/src/pages/ComponentShowcase.tsx:492:                      <div className="p-3 space-y-3">
client/src/pages/ComponentShowcase.tsx:498:                        <div className="border-t pt-3 space-y-2">
client/src/pages/ComponentShowcase.tsx:499:                          <Label className="flex items-center gap-2">
client/src/pages/ComponentShowcase.tsx:500:                            <Clock className="h-4 w-4" />
client/src/pages/ComponentShowcase.tsx:503:                          <div className="flex gap-2">
client/src/pages/ComponentShowcase.tsx:514:                                const newDate = datePickerDate
client/src/pages/ComponentShowcase.tsx:515:                                  ? new Date(datePickerDate)
client/src/pages/ComponentShowcase.tsx:516:                                  : new Date();
client/src/pages/ComponentShowcase.tsx:536:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:537:                  <Label>Searchable Dropdown</Label>
client/src/pages/ComponentShowcase.tsx:538:                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
client/src/pages/ComponentShowcase.tsx:539:                    <PopoverTrigger asChild>
client/src/pages/ComponentShowcase.tsx:544:                        className="w-full justify-between"
client/src/pages/ComponentShowcase.tsx:556:                          : "Select framework..."}
client/src/pages/ComponentShowcase.tsx:557:                        <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
client/src/pages/ComponentShowcase.tsx:560:                    <PopoverContent className="w-full p-0">
client/src/pages/ComponentShowcase.tsx:562:                        <CommandInput placeholder="Search frameworks..." />
client/src/pages/ComponentShowcase.tsx:564:                          <CommandEmpty>No framework found</CommandEmpty>
client/src/pages/ComponentShowcase.tsx:619:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:620:                  <div className="grid grid-cols-2 gap-4">
client/src/pages/ComponentShowcase.tsx:621:                    <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:622:                      <Label htmlFor="month" className="text-sm font-medium">
client/src/pages/ComponentShowcase.tsx:629:                        <SelectTrigger id="month">
client/src/pages/ComponentShowcase.tsx:630:                          <SelectValue placeholder="MM" />
client/src/pages/ComponentShowcase.tsx:646:                    <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:647:                      <Label htmlFor="year" className="text-sm font-medium">
client/src/pages/ComponentShowcase.tsx:654:                        <SelectTrigger id="year">
client/src/pages/ComponentShowcase.tsx:655:                          <SelectValue placeholder="YYYY" />
client/src/pages/ComponentShowcase.tsx:660:                            (_, i) => new Date().getFullYear() - 5 + i
client/src/pages/ComponentShowcase.tsx:662:                            <SelectItem key={year} value={year.toString()}>
client/src/pages/ComponentShowcase.tsx:680:          {/* Data Display Section */}
client/src/pages/ComponentShowcase.tsx:681:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:682:            <h3 className="text-2xl font-semibold">Data Display</h3>
client/src/pages/ComponentShowcase.tsx:684:              <CardContent className="pt-6 space-y-6">
client/src/pages/ComponentShowcase.tsx:685:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:687:                  <div className="flex flex-wrap gap-2">
client/src/pages/ComponentShowcase.tsx:689:                    <Badge variant="secondary">Secondary</Badge>
client/src/pages/ComponentShowcase.tsx:690:                    <Badge variant="destructive">Destructive</Badge>
client/src/pages/ComponentShowcase.tsx:691:                    <Badge variant="outline">Outline</Badge>
client/src/pages/ComponentShowcase.tsx:695:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:697:                  <div className="flex gap-4">
client/src/pages/ComponentShowcase.tsx:699:                      <AvatarImage src="https://github.com/shadcn.png" />
client/src/pages/ComponentShowcase.tsx:708:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:710:                  <Progress value={progress} />
client/src/pages/ComponentShowcase.tsx:711:                  <div className="flex gap-2">
client/src/pages/ComponentShowcase.tsx:727:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:729:                  <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:730:                    <Skeleton className="h-4 w-full" />
client/src/pages/ComponentShowcase.tsx:731:                    <Skeleton className="h-4 w-3/4" />
client/src/pages/ComponentShowcase.tsx:732:                    <Skeleton className="h-4 w-1/2" />
client/src/pages/ComponentShowcase.tsx:736:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:750:                        <PaginationItem key={page}>
client/src/pages/ComponentShowcase.tsx:774:                  <p className="text-sm text-muted-foreground text-center">
client/src/pages/ComponentShowcase.tsx:775:                    Current page: {currentPage}
client/src/pages/ComponentShowcase.tsx:779:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:782:                    <TableCaption>A list of your recent invoices.</TableCaption>
client/src/pages/ComponentShowcase.tsx:785:                        <TableHead className="w-[100px]">Invoice</TableHead>
client/src/pages/ComponentShowcase.tsx:788:                        <TableHead className="text-right">Amount</TableHead>
client/src/pages/ComponentShowcase.tsx:793:                        <TableCell className="font-medium">INV001</TableCell>
client/src/pages/ComponentShowcase.tsx:795:                        <TableCell>Credit Card</TableCell>
client/src/pages/ComponentShowcase.tsx:796:                        <TableCell className="text-right">$250.00</TableCell>
client/src/pages/ComponentShowcase.tsx:799:                        <TableCell className="font-medium">INV002</TableCell>
client/src/pages/ComponentShowcase.tsx:802:                        <TableCell className="text-right">$150.00</TableCell>
client/src/pages/ComponentShowcase.tsx:805:                        <TableCell className="font-medium">INV003</TableCell>
client/src/pages/ComponentShowcase.tsx:807:                        <TableCell>Bank Transfer</TableCell>
client/src/pages/ComponentShowcase.tsx:808:                        <TableCell className="text-right">$350.00</TableCell>
client/src/pages/ComponentShowcase.tsx:814:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:820:                        <MenubarItem>New Tab</MenubarItem>
client/src/pages/ComponentShowcase.tsx:821:                        <MenubarItem>New Window</MenubarItem>
client/src/pages/ComponentShowcase.tsx:839:                        <MenubarItem>Force Reload</MenubarItem>
client/src/pages/ComponentShowcase.tsx:845:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:850:                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
client/src/pages/ComponentShowcase.tsx:854:                        <BreadcrumbLink href="/components">
client/src/pages/ComponentShowcase.tsx:869:          {/* Alerts Section */}
client/src/pages/ComponentShowcase.tsx:870:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:872:            <div className="space-y-4">
client/src/pages/ComponentShowcase.tsx:874:                <AlertCircle className="h-4 w-4" />
client/src/pages/ComponentShowcase.tsx:875:                <AlertTitle>Heads up!</AlertTitle>
client/src/pages/ComponentShowcase.tsx:877:                  You can add components to your app using the cli.
client/src/pages/ComponentShowcase.tsx:880:              <Alert variant="destructive">
client/src/pages/ComponentShowcase.tsx:884:                  Your session has expired. Please log in again.
client/src/pages/ComponentShowcase.tsx:890:          {/* Tabs Section */}
client/src/pages/ComponentShowcase.tsx:891:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:893:            <Tabs defaultValue="account" className="w-full">
client/src/pages/ComponentShowcase.tsx:894:              <TabsList className="grid w-full grid-cols-3">
client/src/pages/ComponentShowcase.tsx:895:                <TabsTrigger value="account">Account</TabsTrigger>
client/src/pages/ComponentShowcase.tsx:896:                <TabsTrigger value="password">Password</TabsTrigger>
client/src/pages/ComponentShowcase.tsx:897:                <TabsTrigger value="settings">Settings</TabsTrigger>
client/src/pages/ComponentShowcase.tsx:899:              <TabsContent value="account">
client/src/pages/ComponentShowcase.tsx:904:                      Make changes to your account here.
client/src/pages/ComponentShowcase.tsx:907:                  <CardContent className="space-y-2">
client/src/pages/ComponentShowcase.tsx:908:                    <div className="space-y-1">
client/src/pages/ComponentShowcase.tsx:909:                      <Label htmlFor="name">Name</Label>
client/src/pages/ComponentShowcase.tsx:910:                      <Input id="name" defaultValue="Pedro Duarte" />
client/src/pages/ComponentShowcase.tsx:914:                    <Button>Save changes</Button>
client/src/pages/ComponentShowcase.tsx:918:              <TabsContent value="password">
client/src/pages/ComponentShowcase.tsx:923:                      Change your password here.
client/src/pages/ComponentShowcase.tsx:926:                  <CardContent className="space-y-2">
client/src/pages/ComponentShowcase.tsx:927:                    <div className="space-y-1">
client/src/pages/ComponentShowcase.tsx:928:                      <Label htmlFor="current">Current password</Label>
client/src/pages/ComponentShowcase.tsx:929:                      <Input id="current" type="password" />
client/src/pages/ComponentShowcase.tsx:931:                    <div className="space-y-1">
client/src/pages/ComponentShowcase.tsx:932:                      <Label htmlFor="new">New password</Label>
client/src/pages/ComponentShowcase.tsx:933:                      <Input id="new" type="password" />
client/src/pages/ComponentShowcase.tsx:937:                    <Button>Save password</Button>
client/src/pages/ComponentShowcase.tsx:941:              <TabsContent value="settings">
client/src/pages/ComponentShowcase.tsx:946:                      Manage your settings here.
client/src/pages/ComponentShowcase.tsx:951:                      Settings content goes here.
client/src/pages/ComponentShowcase.tsx:959:          {/* Accordion Section */}
client/src/pages/ComponentShowcase.tsx:960:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:962:            <Accordion type="single" collapsible className="w-full">
client/src/pages/ComponentShowcase.tsx:963:              <AccordionItem value="item-1">
client/src/pages/ComponentShowcase.tsx:966:                  Yes. It adheres to the WAI-ARIA design pattern.
client/src/pages/ComponentShowcase.tsx:969:              <AccordionItem value="item-2">
client/src/pages/ComponentShowcase.tsx:972:                  Yes. It comes with default styles that matches the other
client/src/pages/ComponentShowcase.tsx:976:              <AccordionItem value="item-3">
client/src/pages/ComponentShowcase.tsx:979:                  Yes. It's animated by default, but you can disable it if you
client/src/pages/ComponentShowcase.tsx:986:          {/* Collapsible Section */}
client/src/pages/ComponentShowcase.tsx:987:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:992:                  <CollapsibleTrigger asChild>
client/src/pages/ComponentShowcase.tsx:993:                    <Button variant="ghost" className="w-full justify-between">
client/src/pages/ComponentShowcase.tsx:994:                      <CardTitle>@peduarte starred 3 repositories</CardTitle>
client/src/pages/ComponentShowcase.tsx:1000:                    <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1001:                      <div className="rounded-md border px-4 py-3 font-mono text-sm">
client/src/pages/ComponentShowcase.tsx:1004:                      <div className="rounded-md border px-4 py-3 font-mono text-sm">
client/src/pages/ComponentShowcase.tsx:1007:                      <div className="rounded-md border px-4 py-3 font-mono text-sm">
client/src/pages/ComponentShowcase.tsx:1017:          {/* Dialog, Sheet, Drawer Section */}
client/src/pages/ComponentShowcase.tsx:1018:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1021:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:1022:                <div className="flex flex-wrap gap-4">
client/src/pages/ComponentShowcase.tsx:1023:                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
client/src/pages/ComponentShowcase.tsx:1024:                    <DialogTrigger asChild>
client/src/pages/ComponentShowcase.tsx:1025:                      <Button variant="outline">Open Dialog</Button>
client/src/pages/ComponentShowcase.tsx:1029:                        <DialogTitle>Test Input</DialogTitle>
client/src/pages/ComponentShowcase.tsx:1031:                          Enter some text below. Press Enter to submit (IME composition supported).
client/src/pages/ComponentShowcase.tsx:1034:                      <div className="space-y-4 py-4">
client/src/pages/ComponentShowcase.tsx:1035:                        <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1036:                          <Label htmlFor="dialog-input">Input</Label>
client/src/pages/ComponentShowcase.tsx:1039:                            placeholder="Type something..."
client/src/pages/ComponentShowcase.tsx:1047:                      <div className="flex justify-end gap-2">
client/src/pages/ComponentShowcase.tsx:1054:                        <Button onClick={handleDialogSubmit}>Submit</Button>
client/src/pages/ComponentShowcase.tsx:1060:                    <SheetTrigger asChild>
client/src/pages/ComponentShowcase.tsx:1061:                      <Button variant="outline">Open Sheet</Button>
client/src/pages/ComponentShowcase.tsx:1065:                        <SheetTitle>Edit profile</SheetTitle>
client/src/pages/ComponentShowcase.tsx:1067:                          Make changes to your profile here. Click save when
client/src/pages/ComponentShowcase.tsx:1075:                    <DrawerTrigger asChild>
client/src/pages/ComponentShowcase.tsx:1076:                      <Button variant="outline">Open Drawer</Button>
client/src/pages/ComponentShowcase.tsx:1080:                        <DrawerTitle>Are you absolutely sure?</DrawerTitle>
client/src/pages/ComponentShowcase.tsx:1082:                          This action cannot be undone.
client/src/pages/ComponentShowcase.tsx:1087:                        <DrawerClose asChild>
client/src/pages/ComponentShowcase.tsx:1088:                          <Button variant="outline">Cancel</Button>
client/src/pages/ComponentShowcase.tsx:1095:                    <PopoverTrigger asChild>
client/src/pages/ComponentShowcase.tsx:1096:                      <Button variant="outline">Open Popover</Button>
client/src/pages/ComponentShowcase.tsx:1099:                      <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1100:                        <h4 className="font-medium leading-none">Dimensions</h4>
client/src/pages/ComponentShowcase.tsx:1102:                          Set the dimensions for the layer.
client/src/pages/ComponentShowcase.tsx:1109:                    <TooltipTrigger asChild>
client/src/pages/ComponentShowcase.tsx:1110:                      <Button variant="outline">Hover me</Button>
client/src/pages/ComponentShowcase.tsx:1113:                      <p>Add to library</p>
client/src/pages/ComponentShowcase.tsx:1121:          {/* Menus Section */}
client/src/pages/ComponentShowcase.tsx:1122:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1125:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:1126:                <div className="flex flex-wrap gap-4">
client/src/pages/ComponentShowcase.tsx:1128:                    <DropdownMenuTrigger asChild>
client/src/pages/ComponentShowcase.tsx:1129:                      <Button variant="outline">Dropdown Menu</Button>
client/src/pages/ComponentShowcase.tsx:1142:                    <ContextMenuTrigger asChild>
client/src/pages/ComponentShowcase.tsx:1143:                      <Button variant="outline">Right Click Me</Button>
client/src/pages/ComponentShowcase.tsx:1154:                    <HoverCardTrigger asChild>
client/src/pages/ComponentShowcase.tsx:1155:                      <Button variant="outline">Hover Card</Button>
client/src/pages/ComponentShowcase.tsx:1158:                      <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1161:                          The React Framework – created and maintained by
client/src/pages/ComponentShowcase.tsx:1172:          {/* Calendar Section */}
client/src/pages/ComponentShowcase.tsx:1173:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1176:              <CardContent className="pt-6 flex justify-center">
client/src/pages/ComponentShowcase.tsx:1187:          {/* Carousel Section */}
client/src/pages/ComponentShowcase.tsx:1188:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1191:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:1192:                <Carousel className="w-full max-w-xs mx-auto">
client/src/pages/ComponentShowcase.tsx:1195:                      <CarouselItem key={index}>
client/src/pages/ComponentShowcase.tsx:1196:                        <div className="p-1">
client/src/pages/ComponentShowcase.tsx:1198:                            <CardContent className="flex aspect-square items-center justify-center p-6">
client/src/pages/ComponentShowcase.tsx:1199:                              <span className="text-4xl font-semibold">
client/src/pages/ComponentShowcase.tsx:1215:          {/* Toggle Section */}
client/src/pages/ComponentShowcase.tsx:1216:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1219:              <CardContent className="pt-6 space-y-4">
client/src/pages/ComponentShowcase.tsx:1220:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1222:                  <div className="flex gap-2">
client/src/pages/ComponentShowcase.tsx:1223:                    <Toggle aria-label="Toggle italic">
client/src/pages/ComponentShowcase.tsx:1224:                      <span className="font-bold">B</span>
client/src/pages/ComponentShowcase.tsx:1226:                    <Toggle aria-label="Toggle italic">
client/src/pages/ComponentShowcase.tsx:1227:                      <span className="italic">I</span>
client/src/pages/ComponentShowcase.tsx:1229:                    <Toggle aria-label="Toggle underline">
client/src/pages/ComponentShowcase.tsx:1230:                      <span className="underline">U</span>
client/src/pages/ComponentShowcase.tsx:1235:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1236:                  <Label>Toggle Group</Label>
client/src/pages/ComponentShowcase.tsx:1237:                  <ToggleGroup type="multiple">
client/src/pages/ComponentShowcase.tsx:1238:                    <ToggleGroupItem value="bold" aria-label="Toggle bold">
client/src/pages/ComponentShowcase.tsx:1239:                      <span className="font-bold">B</span>
client/src/pages/ComponentShowcase.tsx:1241:                    <ToggleGroupItem value="italic" aria-label="Toggle italic">
client/src/pages/ComponentShowcase.tsx:1242:                      <span className="italic">I</span>
client/src/pages/ComponentShowcase.tsx:1246:                      aria-label="Toggle underline"
client/src/pages/ComponentShowcase.tsx:1248:                      <span className="underline">U</span>
client/src/pages/ComponentShowcase.tsx:1256:          {/* Aspect Ratio & Scroll Area Section */}
client/src/pages/ComponentShowcase.tsx:1257:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1258:            <h3 className="text-2xl font-semibold">Layout Components</h3>
client/src/pages/ComponentShowcase.tsx:1260:              <CardContent className="pt-6 space-y-6">
client/src/pages/ComponentShowcase.tsx:1261:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1262:                  <Label>Aspect Ratio (16/9)</Label>
client/src/pages/ComponentShowcase.tsx:1263:                  <AspectRatio ratio={16 / 9} className="bg-muted">
client/src/pages/ComponentShowcase.tsx:1264:                    <div className="flex h-full items-center justify-center">
client/src/pages/ComponentShowcase.tsx:1265:                      <p className="text-muted-foreground">16:9 Aspect Ratio</p>
client/src/pages/ComponentShowcase.tsx:1270:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1271:                  <Label>Scroll Area</Label>
client/src/pages/ComponentShowcase.tsx:1272:                  <ScrollArea className="h-[200px] w-full rounded-md border overflow-hidden">
client/src/pages/ComponentShowcase.tsx:1273:                    <div className="p-4">
client/src/pages/ComponentShowcase.tsx:1274:                      <div className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1276:                          <div key={i} className="text-sm">
client/src/pages/ComponentShowcase.tsx:1277:                            Item {i + 1}: This is a scrollable content area
client/src/pages/ComponentShowcase.tsx:1288:          {/* Resizable Section */}
client/src/pages/ComponentShowcase.tsx:1289:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1290:            <h3 className="text-2xl font-semibold">Resizable Panels</h3>
client/src/pages/ComponentShowcase.tsx:1292:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:1297:                  <ResizablePanel defaultSize={50}>
client/src/pages/ComponentShowcase.tsx:1298:                    <div className="flex h-full items-center justify-center p-6">
client/src/pages/ComponentShowcase.tsx:1299:                      <span className="font-semibold">Panel One</span>
client/src/pages/ComponentShowcase.tsx:1303:                  <ResizablePanel defaultSize={50}>
client/src/pages/ComponentShowcase.tsx:1304:                    <div className="flex h-full items-center justify-center p-6">
client/src/pages/ComponentShowcase.tsx:1305:                      <span className="font-semibold">Panel Two</span>
client/src/pages/ComponentShowcase.tsx:1313:          {/* Toast Section */}
client/src/pages/ComponentShowcase.tsx:1314:          <section className="space-y-4">
client/src/pages/ComponentShowcase.tsx:1317:              <CardContent className="pt-6 space-y-4">
client/src/pages/ComponentShowcase.tsx:1318:                <div className="space-y-2">
client/src/pages/ComponentShowcase.tsx:1319:                  <Label>Sonner Toast</Label>
client/src/pages/ComponentShowcase.tsx:1320:                  <div className="flex flex-wrap gap-2">
client/src/pages/ComponentShowcase.tsx:1324:                        sonnerToast.success("Operation successful", {
client/src/pages/ComponentShowcase.tsx:1325:                          description: "Your changes have been saved",
client/src/pages/ComponentShowcase.tsx:1334:                        sonnerToast.error("Operation failed", {
client/src/pages/ComponentShowcase.tsx:1336:                            "Cannot complete operation, please try again",
client/src/pages/ComponentShowcase.tsx:1346:                          description: "This is an information message",
client/src/pages/ComponentShowcase.tsx:1357:                            "Please note the impact of this operation",
client/src/pages/ComponentShowcase.tsx:1366:                        sonnerToast.loading("Loading", {
client/src/pages/ComponentShowcase.tsx:1367:                          description: "Please wait",
client/src/pages/ComponentShowcase.tsx:1376:                        const promise = new Promise(resolve =>
client/src/pages/ComponentShowcase.tsx:1381:                          success: "Processing complete!",
client/src/pages/ComponentShowcase.tsx:1382:                          error: "Processing failed",
client/src/pages/ComponentShowcase.tsx:1394:          {/* AI ChatBox Section */}
client/src/pages/ComponentShowcase.tsx:1395:          <section className="space-y-4">

## Large spacing/radius/layout candidates
client/src/pages/ComponentShowcase.tsx:250:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:251:                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
client/src/pages/ComponentShowcase.tsx:329:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:388:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:410:              <CardContent className="pt-6 space-y-6">
client/src/pages/ComponentShowcase.tsx:684:              <CardContent className="pt-6 space-y-6">
client/src/pages/ComponentShowcase.tsx:1021:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:1125:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:1176:              <CardContent className="pt-6 flex justify-center">
client/src/pages/ComponentShowcase.tsx:1191:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:1198:                            <CardContent className="flex aspect-square items-center justify-center p-6">
client/src/pages/ComponentShowcase.tsx:1219:              <CardContent className="pt-6 space-y-4">
client/src/pages/ComponentShowcase.tsx:1260:              <CardContent className="pt-6 space-y-6">
client/src/pages/ComponentShowcase.tsx:1292:              <CardContent className="pt-6">
client/src/pages/ComponentShowcase.tsx:1298:                    <div className="flex h-full items-center justify-center p-6">
client/src/pages/ComponentShowcase.tsx:1304:                    <div className="flex h-full items-center justify-center p-6">
client/src/pages/ComponentShowcase.tsx:1317:              <CardContent className="pt-6 space-y-4">
client/src/pages/ComponentShowcase.tsx:1398:              <CardContent className="pt-6">
client/src/pages/ExploreRoute.tsx:68:    <section className="relative -mt-8 mx-2 rounded-[26px] border border-white/10 bg-[#17243a]/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,.3)] backdrop-blur"><div className="flex items-start justify-between gap-4"><div><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#d7fb70]"><Crosshair size={13} /> {checkpoint ? `Checkpoint ${checkpoint.index + 1}/3` : "Route complete"}</p><h1 className="mt-2 font-display text-[28px] tracking-[-.05em]">{checkpoint?.title ?? "Syncing the route"}</h1></div><Map className="shrink-0 text-[#8de4ff]" /></div><p className="mt-3 text-sm leading-relaxed text-[#aebac4]">{checkpoint?.narrative ?? "Your verified quest state is loading."}</p>{checkpoint && <div className="mt-5 grid gap-2">{checkpoint.choices.map(choice => <button key={choice.id} disabled={busy} onClick={() => choose(choice.id)} className="group rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-left transition hover:border-[#d7fb70]/45 hover:bg-[#d7fb70]/[.06] disabled:opacity-60"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium">{choice.title}</p><p className="mt-1 text-xs text-[#98a7b5]">{choice.description}</p></div><span className="font-mono text-xs text-[#d7fb70]">+{choice.momentum}</span></div></button>)}</div>}{busy && <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#d7fb70]"><Loader2 size={14} className="animate-spin" />Verifying route</div>}{error && <p className="mt-4 rounded-xl border border-[#ff9a6e]/30 bg-[#ff9a6e]/10 p-3 text-xs text-[#ffd5c2]">{error}</p>}{!isTelegram && !demoMode && <p className="mt-4 flex gap-2 text-xs leading-relaxed text-[#b6c0c9]"><ShieldCheck size={17} className="shrink-0 text-[#d7fb70]" />Open this route from Telegram to synchronize real progress and rewards.</p>}<p className="mt-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.13em] text-[#91a19d]"><Sparkles size={13} className="text-[#d7fb70]" />Tap the luminous gate to focus the active checkpoint</p></section></main></div>;
client/src/pages/Home.tsx:68:        <section className="relative mt-9 overflow-hidden rounded-[28px] border border-white/[.12] bg-[#1a2639]/80 px-6 pb-6 pt-7 shadow-[0_24px_60px_rgba(0,0,0,.26)]">
client/src/pages/Home.tsx:72:            <div className="mt-7">
client/src/pages/Home.tsx:74:              <h1 className="mt-2 font-display text-[36px] leading-[.95] tracking-[-.055em] text-[#fbf8ed]">{state.player.firstName}<span className="text-[#d7fb70]">.</span></h1>
client/src/pages/Home.tsx:76:            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/10"><div style={{ width: `${xpProgress}%` }} className="h-full rounded-full bg-[#d7fb70] shadow-[0_0_12px_#d7fb70]" /></div>
client/src/pages/Home.tsx:87:        <section className="mt-8 rounded-[24px] border border-[#d7fb70]/20 bg-[#d7fb70]/[.05] p-4"><div className="flex items-center gap-3"><div className="brand-mark"><Sparkles size={18} /></div><div className="flex-1"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#d7fb70]">QUEST//MIND</p><p className="mt-1 text-sm text-[#dce8d2]">{t("questMind")}</p></div><button onClick={() => setLocation("/mind")} className="rounded-xl bg-[#d7fb70] px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[.1em] text-[#16200f]">{t("play")}</button></div></section>
client/src/pages/Home.tsx:89:        <section className="mt-8">
client/src/pages/Home.tsx:97:        <button onClick={() => setLocation("/bonus")} className="mt-7 flex w-full items-center gap-3 rounded-[22px] border border-dashed border-white/[.14] bg-white/[.02] px-4 py-4 text-left"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[.055] text-[#93a2b1]"><Sparkles size={19} /></div><div className="flex-1"><p className="text-[13px] font-medium text-[#dfe6de]">{t("questCoins")}</p><p className="mt-.5 text-[11px] text-[#8290a0]">{t("questMind")}</p></div><ChevronRight size={15} className="text-[#708091]" /></button>
client/src/pages/Leaderboard.tsx:34:        <section className="mt-9"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">{t("season")} · {season}</p><h1 className="mt-2 font-display text-4xl tracking-[-.05em]">{t("leaderboard")}</h1><p className="mt-2 max-w-[330px] text-sm leading-relaxed text-[#9cabba]">{t("mindScore")} and XP define the current Pathfinder order.</p></div><Crown className="text-[#f7d774]" /></div>
client/src/pages/Leaderboard.tsx:38:        {loading ? <div className="mt-12 grid place-items-center text-[#d7fb70]"><Loader2 className="animate-spin" /></div> : error ? <p className="mt-8 rounded-2xl border border-[#ffb28f]/20 bg-[#ffb28f]/[.05] p-5 text-center text-sm text-[#ffb28f]">{error}</p> : rows.length === 0 ? <p className="mt-9 rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-[#9cabba]">{t("noEntries")}</p> : <>
client/src/pages/Leaderboard.tsx:39:          <section className="mt-8 grid grid-cols-3 items-end gap-3" aria-label={t("leaderboard")}>
client/src/pages/Leaderboard.tsx:40:            {podium.map((row, index) => <article key={row.player.id ?? `${row.rank}-${row.player.first_name}`} className={`rounded-[22px] border p-3 text-center ${index === 0 ? "border-[#f7d774]/50 bg-[#f7d774]/[.08] pb-6" : "border-white/10 bg-white/[.035]"}`}><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-[#f7d774]">{index === 0 ? <Trophy size={22} /> : <Medal size={20} />}</div><p className="mt-3 truncate text-sm font-semibold">{row.player.first_name}</p><p className="mt-1 font-mono text-[10px] text-[#9aa8b4]">{t("level")} {row.player.level}</p><p className="mt-3 font-mono text-xs text-[#d7fb70]">{row.score.toLocaleString(language)} XP</p><p className="mt-2 font-display text-lg text-[#f7d774]">#{row.rank}</p></article>)}
client/src/pages/NotFound.tsx:16:        <CardContent className="pt-8 pb-8 text-center">
client/src/pages/QuestResult.tsx:22:  return <div className="game-shell grid min-h-[100dvh] place-items-center p-5 text-[#fbf8ed]"><main className="w-full max-w-[520px] overflow-hidden rounded-[30px] border border-[#d7fb70]/20 bg-[#1a2639]/90 p-7 text-center shadow-[0_24px_60px_rgba(0,0,0,.3)]"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#d7fb70]/15 text-[#d7fb70]"><Trophy size={32} /></div><p className="mt-7 font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">Route complete</p><h1 className="mt-2 font-display text-4xl tracking-[-.05em]">Genesis Run cleared.</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#aebac4]">The relic gate recognizes your path. Your verified rewards have been added to the ledger.</p><div className="mt-8 grid grid-cols-2 gap-3"><Reward icon={<Sparkles size={20} />} value={`+${result?.xpAwarded ?? 25} XP`} label={`Level ${result?.level ?? 1}`} /><Reward icon={<Gem size={20} />} value={`+${result?.relicsAwarded ?? 3} Relics`} label={`${result?.relics ?? 0} total`} /></div><button onClick={() => setLocation("/")} className="mt-8 w-full rounded-2xl bg-[#d7fb70] py-4 font-semibold text-[#16200f] transition active:scale-[.98]">Return to GameQuest Hub</button></main></div>;
client/src/pages/QuestRun.tsx:45:    <div className="game-shell min-h-[100dvh] px-5 pb-8 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)] text-[#fbf8ed]">
client/src/pages/QuestRun.tsx:48:        <div className="mt-9 flex items-center justify-between"><span className="rounded-full border border-[#d7fb70]/20 bg-[#d7fb70]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#d7fb70]">Genesis Run</span><span className="font-mono text-[10px] text-[#9eabb5]">CHECKPOINT {run.checkpoint.index + 1}/3</span></div>
client/src/pages/QuestRun.tsx:49:        <section className="mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-[#1a2639]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,.25)]">
client/src/pages/QuestRun.tsx:51:          <p className="mt-7 font-mono text-[10px] uppercase tracking-[.16em] text-[#a5b690]">Path decision</p>
client/src/pages/QuestRun.tsx:54:          <div className="mt-8 space-y-3">
client/src/pages/QuestRun.tsx:66:function ErrorState({ error, onBack }: { error: string; onBack: () => void }) { return <div className="game-shell grid min-h-[100dvh] place-items-center p-6 text-center text-[#f8f5e9]"><div><Sparkles className="mx-auto text-[#ff9a6e]" /><h1 className="mt-4 font-display text-3xl">Quest unavailable</h1><p className="mt-3 text-sm text-[#aebac4]">{error}</p><button onClick={onBack} className="mt-6 rounded-full bg-[#d7fb70] px-5 py-3 text-sm font-semibold text-[#16200f]">Back to hub</button></div></div>; }
client/src/pages/QuestRun.tsx:67:function PreviewNotice({ onBack }: { onBack: () => void }) { return <div className="game-shell grid min-h-[100dvh] place-items-center p-6 text-center text-[#f8f5e9]"><div><Sparkles className="mx-auto text-[#d7fb70]" /><h1 className="mt-4 font-display text-3xl">Open in Telegram</h1><p className="mt-3 text-sm text-[#aebac4]">Genesis Run needs your verified Telegram identity to save progress securely.</p><button onClick={onBack} className="mt-6 rounded-full bg-[#d7fb70] px-5 py-3 text-sm font-semibold text-[#16200f]">Back to hub</button></div></div>; }
client/src/pages/RewardBonus.tsx:12:  return <div className="game-shell min-h-[100dvh] px-5 pb-8 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#c9d3d9]"><ArrowLeft size={18} /> GameQuest Hub</button><section className="mt-10 rounded-[30px] border border-white/10 bg-[#1a2639]/90 p-7"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d7fb70]/10 text-[#d7fb70]"><Sparkles size={27} /></div><p className="mt-7 font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">Reward vault</p><h1 className="mt-2 font-display text-4xl tracking-[-.05em]">Bonus is protected.</h1><p className="mt-4 text-sm leading-relaxed text-[#aebac4]">Rewarded ads only add relics after the provider sends a verified server-side confirmation.</p>{enabled ? <button disabled={waiting} onClick={start} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d7fb70] py-4 font-semibold text-[#16200f] disabled:opacity-60">{waiting && <Loader2 size={17} className="animate-spin" />}{status === "verifying" ? "Verifying reward…" : "Watch for +5 relics"}</button> : <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm text-[#aebac4]"><LockKeyhole size={18} className="shrink-0 text-[#d7fb70]" />Rewarded ads are not enabled until a verified provider zone is configured.</div>}</section></main></div>;
client/src/pages/QuizArena.tsx:18:      <section className="mt-8 rounded-[28px] border border-white/10 bg-[#17243a]/85 p-5 shadow-[0_22px_60px_rgba(0,0,0,.22)]">
client/src/pages/QuizArena.tsx:19:        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d7fb70]">{t("chooseArena")}</p><h1 className="mt-2 font-display text-[34px] leading-none tracking-[-.055em] text-[#fbf8ed]">Think fast<span className="text-[#d7fb70]">.</span></h1></div><div className="brand-mark"><Brain size={19} /></div></div>
client/src/pages/QuizArena.tsx:21:        <div className="mt-6 grid gap-3">
client/src/pages/QuizArena.tsx:65:  return <div className="game-shell min-h-[100dvh] pb-[calc(var(--tg-safe-area-inset-bottom)+28px)]"><main className="mx-auto w-full max-w-[520px] px-5 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)]"><button onClick={onExit} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#9daab5]"><ArrowLeft size={15} /> Exit arena</button><header className="mt-8 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-[#d7fb70]">{quiz.session.mode} mode · {progress}</p><h1 className="mt-2 font-display text-[31px] leading-none tracking-[-.05em]">Make the call<span className="text-[#d7fb70]">.</span></h1></div><div className="text-right"><div className="flex items-center justify-end gap-1 font-mono text-[18px] text-[#f7d774]"><Timer size={16} />{Math.ceil(remaining / 1000)}s</div><p className="mt-1 font-mono text-[9px] uppercase tracking-[.12em] text-[#7d8b98]">energy {quiz.session.energy}</p></div></header><div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d7fb70] transition-all" style={{ width: `${question ? Math.max(0, Math.min(100, remaining / question.timeLimitMs * 100)) : 0}%` }} /></div>{question && <section className="mt-7 rounded-[28px] border border-white/10 bg-[#17243a]/90 p-5 shadow-[0_22px_60px_rgba(0,0,0,.25)]"><div className="flex items-center justify-between"><span className="rounded-full bg-[#d7fb70]/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.14em] text-[#d7fb70]">{question.category}</span><span className="font-mono text-[9px] uppercase tracking-[.13em] text-[#8291a0]">{question.difficulty}</span></div><h2 className="mt-7 font-display text-[27px] leading-[1.05] tracking-[-.04em] text-[#fbf8ed]">{question.question}</h2><div className="mt-7 grid gap-2.5">{question.answers.map((answer, index) => <button key={answer.id} disabled={busy || Boolean(feedback)} onClick={() => choose(answer.id)} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-3 text-left transition hover:border-[#d7fb70]/45 hover:bg-[#d7fb70]/[.06] disabled:opacity-65"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 font-mono text-xs text-[#94a2af] group-hover:border-[#d7fb70]/40 group-hover:text-[#d7fb70]">{String.fromCharCode(65 + index)}</span><span className="text-sm text-[#edf0e8]">{answer.text}</span></button>)}</div></section>}{feedback && <section className={`mt-4 rounded-2xl border p-4 ${feedback.correct ? "border-[#d7fb70]/35 bg-[#d7fb70]/[.08]" : "border-[#ff9a6e]/35 bg-[#ff9a6e]/[.08]"}`}><div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em]">{feedback.correct ? <Check size={16} className="text-[#d7fb70]" /> : <X size={16} className="text-[#ff9a6e]" />}{feedback.correct ? "Correct signal" : "Wrong signal"}<span className="ml-auto text-[#d7fb70]">{feedback.done ? "Run complete" : `Combo ×${feedback.combo}`}</span></div><p className="mt-3 text-sm leading-relaxed text-[#bec8ce]">{feedback.explanation}</p><div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[.1em] text-[#d7fb70]"><span>+{feedback.qc} QC</span><span>+{feedback.xp} XP</span><span>+{feedback.mind} Mind</span></div>{feedback.done && <button onClick={onExit} className="mt-4 w-full rounded-xl bg-[#d7fb70] py-3 font-semibold text-[#16200f]">RETURN TO HUB</button>}</section>}{error && <p className="mt-4 rounded-xl border border-[#ff9a6e]/25 bg-[#ff9a6e]/10 p-3 text-xs text-[#ffd5c2]">{error}</p>}<p className="mt-5 flex items-center justify-center gap-2 text-center font-mono text-[9px] uppercase tracking-[.12em] text-[#7f8d9b]"><ShieldCheck size={13} className="text-[#d7fb70]" /> Server-verified answer scoring</p></main></div>;
client/src/pages/QuizArena.tsx:87:  return <div className="game-shell min-h-[100dvh] pb-[calc(var(--tg-safe-area-inset-bottom)+28px)]"><main className="mx-auto w-full max-w-[520px] px-5 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)]"><header className="flex items-center justify-between"><button onClick={() => setLocation("/")} className="text-left"><p className="font-display text-[21px] leading-none tracking-[-.04em]">QUEST<span className="text-[#d7fb70]">//</span>MIND</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[.17em] text-[#9fae9d]">{t("thinkFast")} · {t("chooseArena")}</p></button><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 font-mono text-[9px] uppercase tracking-[.13em] text-[#d7fb70]">{isTelegram ? "Verified" : "Preview"}</span></header><ModeSelect selected={selected} onSelect={setSelected} onStart={enterArena} busy={busy} isTelegram={isTelegram && Boolean(initData)} t={t} />{error && <p className="mt-4 rounded-xl border border-[#ff9a6e]/25 bg-[#ff9a6e]/10 p-3 text-xs text-[#ffd5c2]">{error}</p>}<div className="mt-6 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><Flame size={16} className="mx-auto text-[#ff9a6e]" /><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-[#8291a0]">{t("streak")}</p></div><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><Trophy size={16} className="mx-auto text-[#f7d774]" /><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-[#8291a0]">{t("rank")}</p></div><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><Sparkles size={16} className="mx-auto text-[#8de4ff]" /><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-[#8291a0]">{t("mindScore")}</p></div></div></main></div>;
client/src/pages/Profile.tsx:50:        <section className="relative mt-8 overflow-hidden rounded-[28px] border border-white/[.12] bg-[#1a2639]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,.26)]">
client/src/pages/Profile.tsx:54:            <div className="min-w-0 flex-1"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">{t("profile")}</p><h1 className="mt-2 truncate font-display text-[32px] leading-none tracking-[-.05em]">{profile.firstName}<span className="text-[#d7fb70]">.</span></h1><p className="mt-2 truncate text-sm text-[#9dabb8]">{profile.username ? `@${profile.username}` : t("username")}</p></div>
client/src/pages/Profile.tsx:57:          <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/[.08] pt-4 text-[11px] text-[#aeb8b1]"><p className="flex items-center gap-2"><CalendarDays size={14} className="text-[#d7fb70]" /> {formatDate(profile.createdAt, language)}</p><p className="flex items-center justify-end gap-2"><Globe2 size={14} className="text-[#d7fb70]" /> {profile.preferredLanguage.toUpperCase()}</p></div>
client/src/pages/Profile.tsx:62:        <section className="mt-7"><div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#a3b58f]">{t("stats")}</p><h2 className="mt-1 font-display text-[28px] tracking-[-.04em]">{t("dashboard")}</h2></div><button onClick={() => setLocation("/leaderboard")} className="font-mono text-[9px] uppercase tracking-[.12em] text-[#d7fb70]">{t("leaderboard")}</button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{stats.map(({ icon: Icon, label, value }) => <div key={label} className="rounded-2xl border border-white/[.09] bg-white/[.035] px-3 py-3.5"><Icon size={16} className="text-[#d7fb70]" /><p className="mt-4 font-display text-[25px] leading-none">{value}</p><p className="mt-1.5 font-mono text-[9px] uppercase tracking-[.11em] text-[#8490a0]">{label}</p></div>)}</div></section>
client/src/pages/Profile.tsx:64:        <section className="mt-7 rounded-[24px] border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#a3b58f]">{t("level")} {profile.stats.level}</p><p className="mt-2 text-sm text-[#c8d4cf]">{profile.stats.experience.toLocaleString(language)} / {(profile.stats.experience + profile.stats.experienceToNextLevel).toLocaleString(language)} XP</p></div><p className="font-mono text-xs text-[#d7fb70]">{Math.round(profile.stats.experience / Math.max(1, profile.stats.experience + profile.stats.experienceToNextLevel) * 100)}%</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d7fb70]" style={{ width: `${Math.min(100, Math.round(profile.stats.experience / Math.max(1, profile.stats.experience + profile.stats.experienceToNextLevel) * 100))}%` }} /></div></section>
client/src/components/AIChatBox.tsx:203:            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
client/src/components/DashboardLayout.tsx:62:        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
client/src/components/DashboardLayout.tsx:63:          <div className="flex flex-col items-center gap-6">
client/src/components/ErrorBoundary.tsx:27:        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
client/src/components/ErrorBoundary.tsx:28:          <div className="flex flex-col items-center w-full max-w-2xl p-8">
client/src/components/ui/alert-dialog.tsx:55:          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
client/src/components/ui/card.tsx:10:        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
client/src/components/ui/card.tsx:23:        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
client/src/components/ui/card.tsx:78:      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
client/src/components/ui/dialog.tsx:127:          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
client/src/components/ui/empty.tsx:10:        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
client/src/components/ui/field.tsx:13:        "flex flex-col gap-6",
client/src/components/ui/field.tsx:47:        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
client/src/components/ui/sidebar.tsx:416:        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
